import { NextRequest } from 'next/server';

/**
 * Unfurl a URL to get metadata
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  
  if (!url) {
    return new Response(JSON.stringify({ error: 'Missing URL parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  try {
    // Basic URL validation
    new URL(url); // This will throw if URL is invalid
    
    // For PDF URLs, return early with PDF-specific metadata
    if (url.toLowerCase().endsWith('.pdf')) {
      const filename = url.split('/').pop() || 'PDF Document';
      return new Response(JSON.stringify({
        url,
        title: filename,
        description: 'PDF Document',
        contentType: 'application/pdf',
        image: null,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Fetch the HTML content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AgoraBot/1.0)',
      },
    });
    
    if (!response.ok) {
      return new Response(JSON.stringify({ 
        error: `Failed to fetch URL: ${response.status} ${response.statusText}` 
      }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Get content type from response
    const contentType = response.headers.get('content-type') || '';
    
    // If it's a PDF, return PDF-specific metadata
    if (contentType.toLowerCase().includes('application/pdf')) {
      const filename = url.split('/').pop() || 'PDF Document';
      return new Response(JSON.stringify({
        url,
        title: filename,
        description: 'PDF Document',
        contentType: 'application/pdf',
        image: null,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const html = await response.text();
    
    // Extract metadata
    const title = extractMetadata(html, 'title') || 
                 extractMetadata(html, 'og:title') || 
                 extractMetadata(html, 'twitter:title') ||
                 'No title available';
                 
    const description = extractMetadata(html, 'description') || 
                       extractMetadata(html, 'og:description') || 
                       extractMetadata(html, 'twitter:description') ||
                       'No description available';
                       
    const image = extractMetadata(html, 'og:image') || 
                 extractMetadata(html, 'twitter:image') ||
                 null;
    
    return new Response(JSON.stringify({
      url,
      title: title.substring(0, 100),
      description: description.substring(0, 200),
      image,
      contentType,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error unfurling URL:', error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Extract metadata from HTML
 */
function extractMetadata(html: string, name: string): string | null {
  // Check for meta tags
  const metaTagRegex = new RegExp(
    `<meta(?:[^>]*name=["']${name}["'][^>]*content=["']([^"']*)["']|` +
    `[^>]*content=["']([^"']*)["'][^>]*name=["']${name}["']|` +
    `[^>]*property=["']${name}["'][^>]*content=["']([^"']*)["']|` +
    `[^>]*content=["']([^"']*)["'][^>]*property=["']${name}["'])`, 'i'
  );
  
  // Special case for title tag
  if (name === 'title') {
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      return titleMatch[1].trim();
    }
  }
  
  const match = html.match(metaTagRegex);
  if (match) {
    return (match[1] || match[2] || match[3] || match[4]).trim();
  }
  
  return null;
} 