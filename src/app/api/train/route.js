/**
 * POST /api/train
 *
 * Trains the chatbot with new knowledge data.
 * Supports: .md file, .txt file, .json file, plain URL (deep crawl streaming), or raw text.
 */

import { NextResponse } from 'next/server';
import { clearKnowledgeCache, setKnowledgeContext } from '@/components/ChatBot/lib/knowledgeLoader';
import { crawlWebsite } from '@/components/ChatBot/lib/crawler';

// ─── Authorization Helper ──────────────────────────────────────────────────────
function isAuthorized(req) {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) return false; // Fails closed if not set

  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  return token === adminSecret;
}

// ─── Helper: Parse JSON knowledge into readable text ─────────────────────────
function jsonToText(raw) {
  let data;
  try {
    data = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return raw; // Not valid JSON, return as-is
  }

  // Q&A array: [{question, answer}] or [{q, a}]
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
    // Plain array of strings
    return data.join('\n');
  }

  // Object with qa key
  if (data.qa && Array.isArray(data.qa)) {
    return data.qa
      .map((item) => `Q: ${item.q || item.question}\nA: ${item.a || item.answer}`)
      .join('\n\n---\n\n');
  }

  // Any other JSON — pretty print it (LLMs can read this fine)
  return JSON.stringify(data, null, 2);
}

// ─── Main Handler ──────────────────────────────────────────────────────────────

export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed. Please use POST.' }, { status: 405 });
}

export async function POST(req) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = req.headers.get('content-type') || '';
    let content = '';
    let source = '';
    let format = '';

    // ── Branch 1: File Upload (multipart/form-data) ────────────────────────
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file');

      if (!file || typeof file === 'string') {
        return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
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

    // ── Branch 2: JSON body (url / text / json) ───────────────────────────
    else {
      let body;
      try {
        body = await req.json();
      } catch {
        return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
      }

      if (body.url) {
        // STREAMING CRAWLER RESPONSE
        const maxPages = Number(body.maxPages) || 30;
        const encoder = new TextEncoder();
        
        const stream = new ReadableStream({
          async start(controller) {
            try {
              let finalData = '';
              let finalChars = 0;

              for await (const event of crawlWebsite(body.url.trim(), maxPages)) {
                // Send SSE event to client
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));

                if (event.type === 'done') {
                  finalData = event.data;
                  finalChars = event.chars;
                }
              }

              if (finalChars > 0) {
                await setKnowledgeContext(finalData.trim());
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
      } else if (body.text) {
        content = body.text;
        source = 'raw text input';
        format = 'text';
      } else if (body.json) {
        content = jsonToText(body.json);
        source = 'raw JSON input';
        format = 'json';
      } else {
        return NextResponse.json(
          { error: 'Provide a file upload, { url }, { text }, or { json } in the body.' },
          { status: 400 }
        );
      }
    }

    // ── Validate extracted content (for non-streaming requests) ─────────────────────────
    if (!content || content.trim().length < 20) {
      return NextResponse.json(
        { error: 'Extracted content is too short to be useful.' },
        { status: 400 }
      );
    }

    // ── Write to MongoDB knowledge collection ────────────────────────────────────────────
    await setKnowledgeContext(content.trim());

    console.log(
      `[Train API] ✅ Knowledge updated from ${source} (${content.length} chars)`
    );

    return NextResponse.json({
      success: true,
      source,
      format,
      chars: content.length,
      preview: content.trim().slice(0, 400) + (content.length > 400 ? '...' : ''),
    });
  } catch (error) {
    console.error('[Train API] ❌ Error:', error.message);
    return NextResponse.json(
      { error: `Training failed: ${error.message}` },
      { status: 500 }
    );
  }
}
