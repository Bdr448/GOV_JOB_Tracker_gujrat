const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Disable SSL certificate rejection for public feed fetching issues
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Custom .env parser to avoid requiring 'dotenv' dependency
function loadEnv() {
  try {
    const envPath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const index = trimmed.indexOf('=');
        if (index !== -1) {
          const key = trimmed.substring(0, index).trim();
          let value = trimmed.substring(index + 1).trim();
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
          } else if (value.startsWith("'") && value.endsWith("'")) {
            value = value.substring(1, value.length - 1);
          }
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      });
    }
  } catch (err) {
    console.warn("Could not read .env file, relying on environment variables:", err.message);
  }
}
loadEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
  process.exit(1);
}


const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false
  }
});

// Feeds to scrape
const FEEDS = [
  {
    url: "https://www.marugujarat.in/feed",
    defaultSource: "Gujarat Govt / OJAS / GPSC",
    fallbackFile: "mock-marugujarat.xml"
  },
  {
    url: "https://govtjobsalert.in/feed/",
    defaultSource: "Central / SSC / ISRO",
    fallbackFile: "mock-govtjobsalert.xml"
  }
];

// Helper to strip HTML tags
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').trim();
}

// Helper to categorize job based on title and description
function getCategoryAndTags(title, desc) {
  const text = (title + " " + desc).toLowerCase();
  
  let category = "Gujarat Govt";
  let tags = [];

  if (text.includes("police") || text.includes("constable") || text.includes("sub inspector") || text.includes("psi") || text.includes("lokrakshak")) {
    category = "Police";
    tags.push("Police", "Gujarat Govt");
  } else if (text.includes("ssc") || text.includes("cgl") || text.includes("chsl") || text.includes("gd constable")) {
    category = "SSC";
    tags.push("SSC", "Central Govt");
  } else if (text.includes("isro") || text.includes("scientist") || text.includes("engineer") || text.includes("drdo") || text.includes("gate") || text.includes("technical assistant")) {
    category = "Tech Jobs";
    tags.push("Scientist", "Technical", "Engineering");
  } else if (text.includes("gpsc") || text.includes("class-1") || text.includes("class-2") || text.includes("class 1") || text.includes("class 2")) {
    category = "Gujarat Govt";
    tags.push("GPSC", "Gujarat Govt", "Class I/II");
  } else if (text.includes("engineering") || text.includes("civil") || text.includes("mechanical") || text.includes("electrical") || text.includes("junior engineer")) {
    category = "Engineering";
    tags.push("Engineering");
  }

  // Fallbacks & defaults
  if (tags.length === 0) {
    if (text.includes("gujarat") || text.includes("ojas")) {
      tags.push("Gujarat Govt");
    } else {
      tags.push("Central Govt");
    }
  }

  return { category, tags };
}

// Extract department name
function getDepartment(title) {
  const t = title.toUpperCase();
  if (t.includes("GPSC")) return "Gujarat PSC";
  if (t.includes("OJAS")) return "OJAS Gujarat";
  if (t.includes("SSC")) return "SSC";
  if (t.includes("ISRO")) return "ISRO";
  if (t.includes("GUJARAT POLICE")) return "Gujarat Police";
  if (t.includes("GSSSB")) return "GSSSB";
  if (t.includes("RAILWAY") || t.includes("RRB")) return "Railways";
  if (t.includes("BANK") || t.includes("SBI") || t.includes("IBPS")) return "Banking";
  
  // Extract first word or return "Govt Department"
  const words = title.split(' ');
  return words[0].length > 2 ? words[0] : "Government Department";
}

// Extract dates from text (e.g. Last Date: 15-06-2026)
function extractLastDate(text) {
  // Regex to find dates like DD-MM-YYYY or YYYY-MM-DD
  const dateRegex = /\b(\d{1,2})[-/](\d{1,2})[-/](\d{4})\b/;
  const match = text.match(dateRegex);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = match[2].padStart(2, '0');
    const year = match[3];
    return `${year}-${month}-${day}`; // ISO format for Postgres
  }
  
  // Future default last date if not found (2 weeks from now)
  const future = new Date();
  future.setDate(future.getDate() + 14);
  return future.toISOString().split('T')[0];
}

// XML parser to extract <item> fields (title, link, description, pubDate)
function parseFeed(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemContent = match[1];
    
    const titleMatch = itemContent.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || itemContent.match(/<title>([\s\S]*?)<\/title>/);
    const linkMatch = itemContent.match(/<link><!\[CDATA\[([\s\S]*?)\]\]><\/link>/) || itemContent.match(/<link>([\s\S]*?)<\/link>/);
    const descMatch = itemContent.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || itemContent.match(/<description>([\s\S]*?)<\/description>/);
    const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    
    if (titleMatch && linkMatch) {
      items.push({
        title: stripHtml(titleMatch[1]),
        link: stripHtml(linkMatch[1]),
        description: descMatch ? stripHtml(descMatch[1]) : "",
        pubDate: pubDateMatch ? new Date(pubDateMatch[1]) : new Date()
      });
    }
  }
  return items;
}

async function scrape() {
  console.log("Starting Live Job Scraper...");
  let newJobsCount = 0;
  const insertedJobs = [];

  for (const feed of FEEDS) {
    console.log(`Fetching feed: ${feed.url}`);
    try {
      let xmlText = "";
      try {
        const response = await fetch(feed.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'application/xml, text/xml, */*'
          }
        });
        
        let isBlocked = false;
        if (!response.ok) {
          isBlocked = true;
        } else {
          xmlText = await response.text();
          if (xmlText.includes("FortiGuard") || xmlText.includes("Web Filter Violation")) {
            isBlocked = true;
          }
        }
        
        if (isBlocked) {
          console.warn(`URL ${feed.url} is blocked or failed. Falling back to local mock: ${feed.fallbackFile}`);
          xmlText = fs.readFileSync(path.resolve(__dirname, feed.fallbackFile), 'utf8');
        }
      } catch (fetchError) {
        console.warn(`Fetch error for ${feed.url}: ${fetchError.message}. Falling back to local mock: ${feed.fallbackFile}`);
        xmlText = fs.readFileSync(path.resolve(__dirname, feed.fallbackFile), 'utf8');
      }
      const items = parseFeed(xmlText);
      console.log(`Found ${items.length} job items in feed.`);

      for (const item of items) {
        // Deduplicate: Check if job title already exists
        const { data: existing } = await supabase
          .from('jobs')
          .select('id')
          .eq('title', item.title)
          .maybeSingle();

        if (existing) {
          console.log(`Skipping duplicate: "${item.title}"`);
          continue;
        }

        // Parse attributes
        const { category, tags } = getCategoryAndTags(item.title, item.description);
        const department = getDepartment(item.title);
        const lastDate = extractLastDate(item.title + " " + item.description);
        const eligibility = item.description.substring(0, 150) || "Check notification for details";
        const finalYearEligible = item.title.toLowerCase().includes("final year") || item.description.toLowerCase().includes("final year") || category === "Engineering";

        // Insert
        const { error } = await supabase
          .from('jobs')
          .insert({
            title: item.title,
            department: department,
            category: category,
            eligibility: eligibility,
            description: item.description || item.title,
            apply_url: item.link,
            last_date: lastDate,
            posted_date: new Date().toISOString().split('T')[0],
            final_year_eligible: finalYearEligible,
            trending: Math.random() > 0.6, // random trending
            tags: tags
          });

        if (error) {
          console.error(`Error inserting job "${item.title}":`, error.message);
        } else {
          console.log(`Successfully added job: "${item.title}"`);
          newJobsCount++;
          insertedJobs.push({
            title: item.title,
            department: department,
            category: category,
            eligibility: eligibility,
            apply_url: item.link,
            last_date: lastDate,
            tags: tags
          });
        }
      }
    } catch (e) {
      console.error(`Error scraping feed ${feed.url}:`, e);
    }
  }

  console.log(`Daily sync finished. Added ${newJobsCount} new job notifications.`);
  if (insertedJobs.length > 0) {
    await sendEmailAlerts(insertedJobs);
  }
}

async function sendEmailAlerts(newJobs) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.log("RESEND_API_KEY not configured. Skipping daily email alerts.");
    return;
  }

  console.log("Fetching email subscribers...");
  const { data: subscribers, error } = await supabase
    .from('email_subscriptions')
    .select('*')
    .eq('active', true);

  if (error) {
    console.error("Error fetching email subscriptions:", error.message);
    return;
  }

  if (!subscribers || subscribers.length === 0) {
    console.log("No active email subscriptions found.");
    return;
  }

  console.log(`Sending email alerts to ${subscribers.length} subscribers...`);

  for (const sub of subscribers) {
    // Filter jobs matching subscriber categories (if categories is empty, send all)
    const matchingJobs = newJobs.filter(job => {
      if (!sub.categories || sub.categories.length === 0) return true;
      return sub.categories.includes(job.category);
    });

    if (matchingJobs.length === 0) {
      console.log(`No matching jobs for subscriber: ${sub.email}`);
      continue;
    }

    // Build premium email body
    let jobsListHtml = '';
    for (const job of matchingJobs) {
      const tagsBadges = job.tags.map(t => `<span style="background:#2dd4bf;color:#0f172a;padding:2px 6px;border-radius:4px;font-size:11px;margin-right:4px;font-weight:600;">${t}</span>`).join('');
      jobsListHtml += `
        <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px;margin-bottom:16px;color:#f8fafc;font-family:sans-serif;">
          <div style="margin-bottom:8px;">
            <span style="background:rgba(45,212,191,0.15);color:#2dd4bf;border:1px solid rgba(45,212,191,0.3);padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;">${job.category}</span>
          </div>
          <h3 style="margin:0 0 8px 0;font-size:18px;color:#f8fafc;">${job.title}</h3>
          <p style="margin:0 0 12px 0;font-size:14px;color:#94a3b8;">🏢 ${job.department}</p>
          <p style="margin:0 0 12px 0;font-size:14px;color:#cbd5e1;"><strong>Eligibility:</strong> ${job.eligibility}</p>
          <div style="margin-bottom:16px;">
            ${tagsBadges}
          </div>
          <div style="display:flex;align-items:center;justify-content:between;border-top:1px solid #334155;padding-top:12px;margin-top:12px;">
            <span style="font-size:12px;color:#f43f5e;font-weight:500;">📅 Last Date: ${job.last_date}</span>
            <a href="${job.apply_url}" target="_blank" style="background:#2dd4bf;color:#0f172a;text-decoration:none;padding:6px 12px;border-radius:6px;font-size:13px;font-weight:600;margin-left:auto;">Apply Now</a>
          </div>
        </div>
      `;
    }

    const emailHtml = `
      <div style="background:#0f172a;padding:30px 20px;min-height:100%;font-family:sans-serif;color:#f8fafc;">
        <div style="max-width:600px;margin:0 auto;">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="display:inline-block;background:#2dd4bf;color:#0f172a;padding:8px 16px;border-radius:8px;font-weight:bold;font-size:20px;box-shadow:0 4px 12px rgba(45,212,191,0.3);">GovTech Alerts</div>
            <h1 style="margin:16px 0 8px 0;font-size:24px;color:#f8fafc;">New Job Opportunities for You!</h1>
            <p style="margin:0;color:#94a3b8;font-size:14px;">Daily tracking updates for SSC, Gujarat Govt, ISRO & Engineering Exams</p>
          </div>
          
          ${jobsListHtml}
          
          <div style="text-align:center;margin-top:30px;font-size:12px;color:#64748b;border-top:1px solid #1e293b;padding-top:20px;">
            <p>You received this email because you subscribed to GovTech Alerts.</p>
            <p><a href="https://gov-tjob-guardian-pulse.pages.dev/dashboard/alerts" style="color:#2dd4bf;text-decoration:none;">Manage Subscriptions</a></p>
          </div>
        </div>
      </div>
    `;

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'GovTech Alerts <onboarding@resend.dev>',
          to: sub.email,
          subject: `🔔 GovTech Alerts: ${matchingJobs.length} New Job Openings Found!`,
          html: emailHtml
        })
      });

      if (response.ok) {
        console.log(`Email alert sent successfully to ${sub.email}`);
      } else {
        const resText = await response.text();
        console.error(`Failed to send email to ${sub.email}: ${response.statusText} - ${resText}`);
      }
    } catch (sendError) {
      console.error(`Error sending email to ${sub.email}:`, sendError.message);
    }
  }
}

scrape().catch(console.error);
