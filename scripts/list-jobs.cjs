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

async function listJobs() {
  console.log("Fetching all jobs in database...");
  const { data: jobs, error } = await supabase.from('jobs').select('id, title, apply_url, category');
  if (error) {
    console.error("Error fetching jobs:", error.message);
    return;
  }
  console.log(`Total jobs found: ${jobs.length}`);
  jobs.forEach(j => {
    console.log(`- [${j.category}] ${j.title}\n  Apply URL: ${j.apply_url}\n  ID: ${j.id}`);
  });
}

listJobs().catch(console.error);
