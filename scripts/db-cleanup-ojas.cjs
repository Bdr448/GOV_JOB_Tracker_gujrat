const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5cHp0dHhycnJ0dmhlZnJlbWhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTMyNTkwNywiZXhwIjoyMDk0OTAxOTA3fQ.lesQMX1-VDuKkH15yh3dd7CvITJdDCtSl1pMQN27yeM";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function cleanupOjasUrls() {
  console.log("Starting DB update for OJAS apply URLs...");
  
  // 1. Update jobs containing ojas.gujarat.gov.in
  const { data: ojasJobs, error: ojasError } = await supabase
    .from('jobs')
    .select('id, title, apply_url');
    
  if (ojasError) {
    console.error("Error fetching jobs:", ojasError.message);
    return;
  }

  let updatedCount = 0;
  for (const job of ojasJobs) {
    if (
      job.apply_url.includes("ojas.gujarat.gov.in") || 
      job.apply_url.includes("gpsc.gujarat.gov.in") || 
      job.apply_url === "https://ojas.gujarat.gov.in" ||
      job.apply_url === "https://gpsc.gujarat.gov.in"
    ) {
      console.log(`Updating Job: "${job.title}" | Old URL: ${job.apply_url}`);
      const { error: updateError } = await supabase
        .from('jobs')
        .update({ apply_url: "https://www.marugujarat.in/" })
        .eq('id', job.id);
        
      if (updateError) {
        console.error(`Failed to update ${job.title}:`, updateError.message);
      } else {
        updatedCount++;
      }
    }
  }

  console.log(`Updated ${updatedCount} jobs to use Maru Gujarat URL.`);
}

cleanupOjasUrls().catch(console.error);
