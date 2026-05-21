const fs = require('fs');
const path = require('path');

// Disable SSL certificate rejection for public feed fetching issues
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').trim();
}

function parseFeed(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemContent = match[1];
    
    const titleMatch = itemContent.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || itemContent.match(/<title>([\s\S]*?)<\/title>/);
    const linkMatch = itemContent.match(/<link><!\[CDATA\[([\s\S]*?)\]\]><\/link>/) || itemContent.match(/<link>([\s\S]*?)<\/link>/);
    
    if (titleMatch && linkMatch) {
      items.push({
        title: stripHtml(titleMatch[1]),
        link: stripHtml(linkMatch[1])
      });
    }
  }
  return items;
}

async function inspectFeed() {
  const url = "https://www.marugujarat.in/feed";
  console.log(`Fetching live feed from ${url}...`);
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/xml, text/xml, */*'
      }
    });
    
    if (!response.ok) {
      console.log(`Failed to fetch live feed: HTTP ${response.status} ${response.statusText}`);
      return;
    }
    
    const xmlText = await response.text();
    if (xmlText.includes("FortiGuard") || xmlText.includes("Web Filter Violation")) {
      console.log("Feed is blocked by local firewall.");
      return;
    }
    
    const items = parseFeed(xmlText);
    console.log(`Found ${items.length} items:`);
    items.forEach((item, idx) => {
      console.log(`${idx + 1}. Title: ${item.title}`);
      console.log(`   Link:  ${item.link}`);
    });
  } catch (err) {
    console.error("Error inspecting feed:", err.message);
  }
}

inspectFeed().catch(console.error);
