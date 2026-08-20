import * as cheerio from 'cheerio';
import TurndownService from 'turndown';

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
});

turndownService.remove(['script', 'style', 'noscript', 'nav', 'footer', 'header', 'aside', 'iframe', 'svg']);

const SKIP_EXTENSIONS = new Set([
  '.pdf', '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt',
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico',
  '.mp4', '.mp3', '.avi', '.zip', '.rar', '.tar', '.gz',
  '.woff', '.woff2', '.ttf', '.eot',
  '.js', '.ts', '.css', '.map',
  '.xml', '.json', '.rss', '.atom',
]);

const SKIP_PATTERNS = [
  /\?/,
  /#/,
  /\/auth\//i, /\/login/i, /\/logout/i, /\/admin\//i,
  /\/api\//i, /\/_next\//i, /\/cdn-cgi\//i,
  /\/wp-admin\//i, /\/feed\//i, /\/sitemap/i,
];

/**
 * Strict SSRF Protection: verify if URL hostname targets internal/private network
 */
function isPrivateOrLocalHost(urlObj) {
  const protocol = urlObj.protocol.toLowerCase();
  if (protocol !== 'http:' && protocol !== 'https:') return true;

  const hostname = urlObj.hostname.toLowerCase();

  // Block localhost and internal names
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname === '::1' ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.lan')
  ) {
    return true;
  }

  // Check IPv4 private ranges
  const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const [, a, b] = ipv4Match.map(Number);
    if (a === 127) return true; // 127.0.0.0/8
    if (a === 10) return true;  // 10.0.0.0/8
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 169 && b === 254) return true; // 169.254.0.0/16 (Cloud Metadata)
    if (a === 0) return true;
  }

  return false;
}

function shouldSkipUrl(urlObj) {
  if (isPrivateOrLocalHost(urlObj)) return true;

  const pathname = urlObj.pathname.toLowerCase();
  const ext = pathname.includes('.') ? '.' + pathname.split('.').pop() : '';
  
  if (ext && SKIP_EXTENSIONS.has(ext)) return true;
  if (SKIP_PATTERNS.some(p => p.test(urlObj.href))) return true;
  return false;
}

async function fetchWithRetry(url, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(12000),
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('text/html') && !contentType.includes('text/plain') && !contentType.includes('application/xhtml')) {
        return { ok: false, status: res.status, reason: `Non-HTML content-type: ${contentType.split(';')[0]}` };
      }

      if (!res.ok) {
        return { ok: false, status: res.status, reason: `HTTP ${res.status}` };
      }

      const html = await res.text();
      
      if (html.startsWith('%PDF') || html.startsWith('PK')) {
        return { ok: false, status: 200, reason: 'Binary file detected' };
      }

      return { ok: true, html };
    } catch (err) {
      if (attempt === maxRetries) {
        return { ok: false, status: 0, reason: err.message };
      }
      await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
    }
  }
}

function extractContent($, cleanUrl, pageTitle) {
  const selectors = [
    'main', 'article', '[role="main"]', '#content', '.content',
    '#main', '.main', '.container', '#app', '#root', '.page', '.wrapper', 'body',
  ];

  let contentHtml = '';
  for (const sel of selectors) {
    const el = $(sel);
    if (el.length > 0) {
      el.find('nav, footer, header, aside, .nav, .footer, .header, .sidebar, .cookie-banner').remove();
      contentHtml = el.html() || '';
      if (contentHtml.length > 200) break;
    }
  }

  if (!contentHtml) return null;

  let markdown = turndownService.turndown(contentHtml);
  markdown = markdown
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .trim();

  if (markdown.length < 100) return null;
  return markdown;
}

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

  if (isPrivateOrLocalHost(parsedStart)) {
    yield { type: 'error', message: `Security Rejection: SSRF Protection blocked internal address target ${parsedStart.hostname}` };
    return;
  }

  const baseDomain = parsedStart.hostname;
  const limit = maxPages === 0 ? Infinity : maxPages;

  let crawledData = `# Website Knowledge Base: ${baseDomain}\nCrawled at: ${new Date().toISOString()}\n\n`;
  let totalChars = 0;
  let pagesCrawled = 0;
  let pagesFailed = 0;
  let pagesSkipped = 0;

  while (queue.length > 0 && pagesCrawled < limit) {
    const currentUrl = queue.shift();

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

    if (shouldSkipUrl(urlObj)) {
      pagesSkipped++;
      yield { type: 'warning', message: `Skipped (non-HTML/SSRF block): ${urlObj.pathname}` };
      continue;
    }

    const pageNum = pagesCrawled + 1;
    const limitStr = limit === Infinity ? '' : `/${limit}`;
    yield { type: 'progress', message: `[${pageNum}${limitStr}] Crawling: ${urlObj.pathname}` };

    const result = await fetchWithRetry(cleanUrl);

    if (!result.ok) {
      pagesFailed++;
      yield { type: 'warning', message: `Failed ${urlObj.pathname}: ${result.reason}` };
      continue;
    }

    const { html } = result;
    const $ = cheerio.load(html);

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
      
      try {
        const absoluteUrl = new URL(href, cleanUrl);
        if (absoluteUrl.hostname === baseDomain && !isPrivateOrLocalHost(absoluteUrl)) {
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

    const pageTitle = $('title').text().trim() || $('h1').first().text().trim() || urlObj.pathname;
    const markdown = extractContent($, cleanUrl, pageTitle);

    if (!markdown) {
      const metaDesc = $('meta[name="description"]').attr('content') ||
                       $('meta[property="og:description"]').attr('content') || '';
      const ogTitle = $('meta[property="og:title"]').attr('content') || '';
      
      if (metaDesc || ogTitle) {
        const metaContent = `## Page: ${pageTitle}\nURL: ${cleanUrl}\n\n${ogTitle ? `**${ogTitle}**\n\n` : ''}${metaDesc}\n\n---\n\n`;
        crawledData += metaContent;
        totalChars += metaContent.length;
        pagesCrawled++;
        yield { type: 'success', message: `Extracted meta info from ${urlObj.pathname}` };
      } else {
        pagesFailed++;
        yield { type: 'warning', message: `No static content on ${urlObj.pathname}` };
      }
      continue;
    }

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
