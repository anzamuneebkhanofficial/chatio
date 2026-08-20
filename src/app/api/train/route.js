import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { isMasterOwnerRequest } from '@/lib/ownerAuth';
import dbConnect from '@/lib/dbConnect';
import { UserConfig } from '@/models';
import { setKnowledgeContext, clearKnowledgeCache } from '@/components/ChatBot/lib/knowledgeLoader';
import { crawlWebsite } from '@/components/ChatBot/lib/crawler';
import { saveKnowledge } from '@/lib/multiUserDb';
import { invalidateResponseCache } from '@/components/ChatBot/lib/responseCache';

function jsonToText(raw) {
  let data;
  try {
    data = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return raw;
  }

  if (Array.isArray(data)) {
    const isQA = data[0]?.question || data[0]?.q;
    if (isQA) {
      return data
        .map((item) => {
          const q = item.question || item.q || '';
          const a = item.answer || item.a || '';
          return `Q: ${q}\nA: ${a}`;
        })
        .join('\n\n---\n\n');
    }
    return data.join('\n');
  }

  if (data.qa && Array.isArray(data.qa)) {
    return data.qa
      .map((item) => `Q: ${item.q || item.question}\nA: ${item.a || item.answer}`)
      .join('\n\n---\n\n');
  }

  return JSON.stringify(data, null, 2);
}

export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed. Please use POST.' }, { status: 405 });
}

export async function POST(req) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let content = '';
    let source = '';
    let format = '';
    let appId = '';
    let rawBody = null;
    let file = null;

    // File Upload (multipart/form-data)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      file = formData.get('file');
      appId = formData.get('appId') || '';

      if (!file || typeof file === 'string') {
        return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
      }

      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'File size exceeds 10MB limit.' }, { status: 400 });
      }

      const fileName = file.name || 'upload';
      const ext = fileName.toLowerCase().slice(fileName.lastIndexOf('.'));
      const rawText = await file.text();

      if (!rawText?.trim()) {
        return NextResponse.json({ error: 'File is empty.' }, { status: 400 });
      }

      if (ext === '.json') {
        content = jsonToText(rawText);
        format = 'json';
      } else if (ext === '.md' || ext === '.txt') {
        content = rawText;
        format = ext.replace('.', '');
      } else {
        return NextResponse.json(
          { error: `Unsupported file type "${ext}". Use .md, .txt, or .json.` },
          { status: 400 }
        );
      }

      source = `file: ${fileName}`;
    }
    // JSON body (url / text / json)
    else {
      try {
        rawBody = await req.json();
      } catch {
        return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
      }
      appId = rawBody.appId || '';
    }

    // ── STRICT AUTHORIZATION SPLITTING ──
    let authenticatedUserId = null;

    if (appId) {
      // 1. User chatbot training — authenticate via Clerk
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized. Please log in to train your bot.' }, { status: 401 });
      }

      await dbConnect();
      const userBot = await UserConfig.findOne({ userId, appId });
      if (!userBot) {
        return NextResponse.json({ error: 'Forbidden: You do not own this bot.' }, { status: 403 });
      }
      authenticatedUserId = userId;
    } else {
      // 2. Global platform bot training — authenticate via Master Owner check
      if (!isMasterOwnerRequest(req)) {
        return NextResponse.json({ error: 'Unauthorized: Master owner access required for platform training.' }, { status: 401 });
      }
    }

    // Handle crawling stream if URL was provided
    if (rawBody && rawBody.url) {
      const maxPages = Number(rawBody.maxPages) || 30;
      const encoder = new TextEncoder();
      
      const stream = new ReadableStream({
        async start(controller) {
          try {
            let finalData = '';
            let finalChars = 0;

            for await (const event of crawlWebsite(rawBody.url.trim(), maxPages)) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));

              if (event.type === 'done') {
                finalData = event.data;
                finalChars = event.chars;
              }
            }

            if (finalChars > 0) {
              if (appId) {
                await saveKnowledge(appId, authenticatedUserId || 'user', finalData.trim());
                invalidateResponseCache(appId);
              } else {
                await setKnowledgeContext(finalData.trim());
                clearKnowledgeCache();
                invalidateResponseCache('global');
              }
            }
            controller.close();
          } catch (err) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`));
            controller.close();
          }
        }
      });

      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Handle text or json if not file upload
    if (!file && rawBody) {
      if (rawBody.text) {
        content = rawBody.text;
        source = 'raw text input';
        format = 'text';
      } else if (rawBody.json) {
        content = jsonToText(rawBody.json);
        source = 'raw JSON input';
        format = 'json';
      } else {
        return NextResponse.json(
          { error: 'Provide a file upload, { url }, { text }, or { json } in the body.' },
          { status: 400 }
        );
      }
    }

    if (!content || content.trim().length < 20) {
      return NextResponse.json(
        { error: 'Extracted content is too short to be useful (minimum 20 characters).' },
        { status: 400 }
      );
    }

    if (appId) {
      await saveKnowledge(appId, authenticatedUserId || 'user', content.trim());
      invalidateResponseCache(appId);
    } else {
      await setKnowledgeContext(content.trim());
      clearKnowledgeCache();
      invalidateResponseCache('global');
    }

    return NextResponse.json({
      success: true,
      source,
      format,
      chars: content.length,
      preview: content.trim().slice(0, 400) + (content.length > 400 ? '...' : ''),
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Training failed: ${error.message}` },
      { status: 500 }
    );
  }
}
