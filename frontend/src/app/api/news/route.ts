import { NextResponse } from 'next/server';

export interface FinanceNewsItem {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  url: string;
  category?: string;
  imageUrl?: string;
}

// In-memory cache for news items (10 min TTL)
let cachedNews: FinanceNewsItem[] = [];
let lastFetchedAt = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Helper to extract text inside XML tags
function extractTagContent(xml: string, tag: string): string {
  const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i');
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch && cdataMatch[1]) {
    return cdataMatch[1].trim();
  }
  const regularRegex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = xml.match(regularRegex);
  return match && match[1] ? match[1].replace(/<[^>]+>/g, '').trim() : '';
}

export async function GET() {
  const now = Date.now();
  if (cachedNews.length > 0 && now - lastFetchedAt < CACHE_TTL_MS) {
    return NextResponse.json({
      success: true,
      items: cachedNews,
      cached: true,
      fetchedAt: new Date(lastFetchedAt).toISOString(),
    });
  }

  try {
    // Fetch Google News India Business & Finance RSS feed
    const rssUrl = 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-IN&gl=IN&ceid=IN:en';
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ArthAI/1.0',
      },
      next: { revalidate: 600 }, // 10 minutes ISR if supported
    });

    if (!response.ok) {
      throw new Error(`RSS feed returned status ${response.status}`);
    }

    const xmlText = await response.text();
    const itemMatches = xmlText.match(/<item>[\s\S]*?<\/item>/gi) || [];

    const items: FinanceNewsItem[] = [];

    for (let i = 0; i < Math.min(itemMatches.length, 10); i++) {
      const itemXml = itemMatches[i];
      const rawTitle = extractTagContent(itemXml, 'title');
      const link = extractTagContent(itemXml, 'link') || extractTagContent(itemXml, 'guid');
      const pubDate = extractTagContent(itemXml, 'pubDate');
      const source = extractTagContent(itemXml, 'source') || 'Finance News';

      // Parse and clean title and source from Google News format "Title - Publisher"
      let cleanTitle = rawTitle;
      let cleanSource = source;
      if (rawTitle.includes(' - ')) {
        const parts = rawTitle.split(' - ');
        if (parts.length > 1) {
          cleanSource = parts[parts.length - 1].trim();
          cleanTitle = parts.slice(0, parts.length - 1).join(' - ').trim();
        }
      }

      if (cleanTitle && link) {
        items.push({
          id: `news-${i}-${Date.now()}`,
          title: cleanTitle,
          source: cleanSource,
          publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          url: link,
          category: 'Markets & Economy',
        });
      }
    }

    if (items.length > 0) {
      cachedNews = items;
      lastFetchedAt = now;
    }

    return NextResponse.json({
      success: true,
      items: cachedNews,
      cached: false,
      fetchedAt: new Date(lastFetchedAt).toISOString(),
    });
  } catch (error) {
    console.error('Failed to fetch finance news:', error);
    // If cache exists from prior fetch, return stale cache gracefully
    if (cachedNews.length > 0) {
      return NextResponse.json({
        success: true,
        items: cachedNews,
        cached: true,
        stale: true,
        fetchedAt: new Date(lastFetchedAt).toISOString(),
      });
    }

    return NextResponse.json(
      {
        success: false,
        items: [],
        error: 'Finance news is temporarily unavailable.',
      },
      { status: 503 }
    );
  }
}
