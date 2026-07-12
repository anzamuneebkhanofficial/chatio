import * as cheerio from 'cheerio';
import TurndownService from 'turndown';

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
});

// Remove boilerplate and non-content elements
turndownService.remove(['script', 'style', 'noscript', 'nav', 'footer', 'header', 'aside', 'iframe', 'svg']);

// List of file extensions that are NEVER HTML pages — skip them
const SKIP_EXTENSIONS = new Set([
  '.pdf', '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt',
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico',
  '.mp4', '.mp3', '.avi', '.zip', '.rar', '.tar', '.gz',
  '.woff', '.woff2', '.ttf', '.eot',
  '.js', '.ts', '.css', '.map',
  '.xml', '.json', '.rss', '.atom',
]);

// URL patterns to skip (tracking, auth, admin paths)
const SKIP_PATTERNS = [
  /\?/, // Skip URLs with query parameters
  /#/,  // Skip fragment-only links
  /\/auth\//i, /\/login/i, /\/logout/i, /\/admin\//i,
  /\/api\//i, /\/_next\//i, /\/cdn-cgi\//i,
  /\/wp-admin\//i, /\/feed\//i, /\/sitemap/i,
];

/**
 * Check if a URL should be skipped based on extension or pattern
 */
function shouldSkipUrl(urlObj) {
  const pathname = urlObj.pathname.toLowerCase();
  const ext = pathname.includes('.') ? '.' + pathname.split('.').pop() : '';
  
  if (ext && SKIP_EXTENSIONS.has(ext)) return true;
  if (SKIP_PATTERNS.some(p => p.test(urlObj.href))) return true;
  return false;
}

/**
 * Fetch a page with retry logic. Retries up to `maxRetries` times on failure.
 */
async function fetchWithRetry(url, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
        },
        signal: AbortSignal.timeout(12000),
      });

      // Check content type — refuse binary/non-HTML responses immediately
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('text/html') && !contentType.includes('text/plain') && !contentType.includes('application/xhtml')) {
        return { ok: false, status: res.status, reason: `Non-HTML content-type: ${contentType.split(';')[0]}` };
      }

      if (!res.ok) {
        return { ok: false, status: res.status, reason: `HTTP ${res.status}` };
      }

      const html = await res.text();
      
      // Sanity check: if it starts with PDF magic bytes, it's a binary file
      if (html.startsWith('%PDF') || html.startsWith('PK')) {
        return { ok: false, status: 200, reason: 'Binary file detected (PDF or Office document)' };
      }

      return { ok: true, html };
    } catch (err) {
      if (attempt === maxRetries) {
        return { ok: false, status: 0, reason: err.message };
      }
      // Brief pause before retry
      await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
    }
  }
}

/**
 * Extract text content from HTML, prioritizing main content selectors.
 * Falls back gracefully for SPAs (content may be in different elements).
 */
function extractContent($, cleanUrl, pageTitle) {
  // Try progressively less-specific selectors
  const selectors = [
    'main',
    'article',
    '[role="main"]',
    '#content',
    '.content',
    '#main',
    '.main',
    '.container',
    '#app',           // For React apps
    '#root',          // For React apps
    '.page',
    '.wrapper',
    'body',
  ];

  let contentHtml = '';
  for (const sel of selectors) {
    const el = $(sel);
    if (el.length > 0) {
      // Remove known nav/footer/sidebar elements from the selection
      el.find('nav, footer, header, aside, .nav, .footer, .header, .sidebar, .cookie-banner').remove();
      contentHtml = el.html() || '';
      if (contentHtml.length > 200) break; // Found something useful
    }
  }

  if (!contentHtml) return null;

  // Convert HTML to Markdown
  let markdown = turndownService.turndown(contentHtml);

  // Strip excessive whitespace
  markdown = markdown
    .replace(/\n{3,}/g, '\n\n')   // Collapse 3+ newlines to 2
    .replace(/[ \t]+\n/g, '\n')   // Remove trailing spaces
    .replace(/\n[ \t]+/g, '\n')   // Remove leading spaces on lines
    .trim();

  // If the extracted text is too short, the page is likely a JS SPA
  if (markdown.length < 100) return null;

  return markdown;
}

/**
 * Recursively crawls a website up to maxPages, extracting internal links and markdown content.
 * Retries failed pages once. Skips binary files, non-HTML responses, and irrelevant URLs.
 * Yields progress events to be streamed to the client UI.
 *
 * @param {string} startUrl - The URL to start crawling from.
 * @param {number} maxPages - Maximum number of pages to crawl. 0 = unlimited.
 */
export async function* crawlWebsite(startUrl, maxPages = 30) {
  const visited = new Set();
  const queue = [startUrl];
  let parsedStart;

  try {
    parsedStart = new URL(startUrl);
  } catch (err) {
    yield { type: 'error', message: `Invalid start URL: ${startUrl}` };
    return;
  }

  const baseDomain = parsedStart.hostname;
  const limit = maxPages === 0 ? Infinity : maxPages;

  // The final accumulated data
  let crawledData = `# Website Knowledge Base: ${baseDomain}\nCrawled at: ${new Date().toISOString()}\n\n`;
  let totalChars = 0;
  let pagesCrawled = 0;
  let pagesFailed = 0;
  let pagesSkipped = 0;

  while (queue.length > 0 && pagesCrawled < limit) {
    const currentUrl = queue.shift();

    // Normalize URL to prevent duplicates
    let urlObj;
    try {
      urlObj = new URL(currentUrl);
    } catch {
      continue;
    }
    urlObj.hash = '';
    const cleanUrl = urlObj.href;

    if (visited.has(cleanUrl)) continue;
    visited.add(cleanUrl);

    // Skip URLs we know we can't handle
    if (shouldSkipUrl(urlObj)) {
      pagesSkipped++;
      yield { type: 'warning', message: `Skipped (non-HTML): ${urlObj.pathname}` };
      continue;
    }

    const pageNum = pagesCrawled + 1;
    const limitStr = limit === Infinity ? '' : `/${limit}`;
    yield { type: 'progress', message: `[${pageNum}${limitStr}] Crawling: ${urlObj.pathname}` };

    // Fetch with retry
    const result = await fetchWithRetry(cleanUrl);

    if (!result.ok) {
      pagesFailed++;
      yield { type: 'warning', message: `Failed ${urlObj.pathname}: ${result.reason}` };
      continue;
    }

    const { html } = result;
    const $ = cheerio.load(html);

    // Extract internal links and add to queue (before extracting content)
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
      
      try {
        const absoluteUrl = new URL(href, cleanUrl);
        // Only follow links on the same domain
        if (absoluteUrl.hostname === baseDomain) {
          absoluteUrl.hash = '';
          const normalized = absoluteUrl.href;
          if (!visited.has(normalized) && !queue.includes(normalized)) {
            queue.push(normalized);
          }
        }
      } catch {
        // Ignore invalid hrefs
      }
    });

    // Extract page title
    const pageTitle = $('title').text().trim() || $('h1').first().text().trim() || urlObj.pathname;

    // Extract and convert content
    const markdown = extractContent($, cleanUrl, pageTitle);

    if (!markdown) {
      // The page appears to be a JS-rendered SPA with no static text content.
      // Try to extract what little we can from meta tags and Open Graph.
      const metaDesc = $('meta[name="description"]').attr('content') ||
                       $('meta[property="og:description"]').attr('content') || '';
      const ogTitle = $('meta[property="og:title"]').attr('content') || '';
      
      if (metaDesc || ogTitle) {
        // At least save the meta description
        const metaContent = `## Page: ${pageTitle}\nURL: ${cleanUrl}\n\n${ogTitle ? `**${ogTitle}**\n\n` : ''}${metaDesc}\n\n---\n\n`;
        crawledData += metaContent;
        totalChars += metaContent.length;
        pagesCrawled++;
        yield { type: 'success', message: `Extracted meta info from ${urlObj.pathname} (SPA page)` };
      } else {
        pagesFailed++;
        yield { type: 'warning', message: `No content on ${urlObj.pathname} (likely JS-rendered, no meta tags)` };
      }
      continue;
    }

    // Assemble the page entry with a clear URL header so the AI can cite sources
    const pageEntry = `## Page: ${pageTitle}\nURL: ${cleanUrl}\n\n${markdown}\n\n---\n\n`;
    crawledData += pageEntry;
    totalChars += markdown.length;
    pagesCrawled++;

    yield {
      type: 'success',
      message: `Extracted ${markdown.length.toLocaleString()} chars from ${urlObj.pathname}`,
    };
  }

  yield {
    type: 'done',
    data: crawledData,
    chars: totalChars,
    pages: pagesCrawled,
    failed: pagesFailed,
    discovered: visited.size,
    skipped: pagesSkipped,
  };
}
