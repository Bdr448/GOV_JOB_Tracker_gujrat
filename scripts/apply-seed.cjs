const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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
    console.warn("Could not read .env file:", err.message);
  }
}
loadEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5cHp0dHhycnJ0dmhlZnJlbWhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTMyNTkwNywiZXhwIjoyMDk0OTAxOTA3fQ.lesQMX1-VDuKkH15yh3dd7CvITJdDCtSl1pMQN27yeM";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const mockSources = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'OJAS Gujarat', url: 'https://www.marugujarat.in/', description: 'Online Job Application System - Gujarat Government', active: true },
  { id: '22222222-2222-2222-2222-222222222222', name: 'GPSC Official', url: 'https://www.marugujarat.in/', description: 'Gujarat Public Service Commission', active: true },
  { id: '33333333-3333-3333-3333-333333333333', name: 'SSC Official', url: 'https://ssc.nic.in', description: 'Staff Selection Commission', active: true },
  { id: '44444444-4444-4444-4444-444444444444', name: 'ISRO Careers', url: 'https://www.isro.gov.in/Careers.html', description: 'Indian Space Research Organisation', active: true }
];

const mockJobs = [
  {
    id: '277e997f-9cd3-4120-a00d-07092a49178c',
    title: 'ISRO Scientist/Engineer SC 2026',
    department: 'ISRO',
    source_id: '44444444-4444-4444-4444-444444444444',
    category: 'Tech Jobs',
    eligibility: 'BE/BTech in CS/ECE/Mech with 65%',
    description: 'Recruitment of Scientist/Engineer-SC in various disciplines.',
    apply_url: 'https://www.isro.gov.in/Careers.html',
    last_date: '2026-06-11',
    posted_date: '2026-05-21',
    final_year_eligible: true,
    trending: true,
    tags: ['Scientist', 'Engineering', 'Central Govt']
  },
  {
    id: '0a300b6a-ec30-4adb-9513-057c5109eab8',
    title: 'GPSC Assistant Engineer (Civil)',
    department: 'Gujarat PSC',
    source_id: '22222222-2222-2222-2222-222222222222',
    category: 'Engineering',
    eligibility: 'BE Civil Engineering',
    description: '300+ vacancies for Assistant Engineer (Civil) Class II.',
    apply_url: 'https://www.marugujarat.in/',
    last_date: '2026-06-04',
    posted_date: '2026-05-21',
    final_year_eligible: true,
    trending: true,
    tags: ['Civil', 'Gujarat Govt', 'Class II']
  },
  {
    id: '5ebea524-304b-4b55-94f0-1e2707ae3bd3',
    title: 'SSC CGL 2026 Notification',
    department: 'SSC',
    source_id: '33333333-3333-3333-3333-333333333333',
    category: 'SSC',
    eligibility: "Bachelor's degree in any discipline",
    description: 'Combined Graduate Level Examination 2026 - 17000+ posts.',
    apply_url: 'https://ssc.nic.in',
    last_date: '2026-06-20',
    posted_date: '2026-05-21',
    final_year_eligible: true,
    trending: true,
    tags: ['Graduate', 'Tier-1']
  },
  {
    id: 'e582b4b8-d340-4ec9-8074-7613483af5b7',
    title: 'Gujarat Police Constable Bharti',
    department: 'Home Department',
    source_id: '11111111-1111-1111-1111-111111111111',
    category: 'Police',
    eligibility: '12th Pass, age 18-33',
    description: 'Recruitment of 12000+ Lokrakshak / Constable posts.',
    apply_url: 'https://www.marugujarat.in/',
    last_date: '2026-06-08',
    posted_date: '2026-05-21',
    final_year_eligible: false,
    trending: true,
    tags: ['Police', 'Gujarat Govt', '12th Pass']
  },
  {
    id: 'd0dc4cfc-18f9-4434-8b97-aebf439bd08f',
    title: 'SSC GD Constable 2026',
    department: 'SSC',
    source_id: '33333333-3333-3333-3333-333333333333',
    category: 'Police',
    eligibility: '10th Pass, age 18-23',
    description: 'General Duty Constable in CAPFs, NIA, SSF.',
    apply_url: 'https://ssc.nic.in',
    last_date: '2026-06-15',
    posted_date: '2026-05-21',
    final_year_eligible: false,
    trending: false,
    tags: ['Constable', 'Defence']
  },
  {
    id: '0959fb21-3eca-4d5c-b024-858b6c8ee1d5',
    title: 'OJAS Junior Clerk',
    department: 'GSSSB',
    source_id: '11111111-1111-1111-1111-111111111111',
    category: 'Gujarat Govt',
    eligibility: '12th Pass with CCC',
    description: '4000+ Junior Clerk vacancies across Gujarat.',
    apply_url: 'https://www.marugujarat.in/',
    last_date: '2026-05-31',
    posted_date: '2026-05-21',
    final_year_eligible: true,
    trending: false,
    tags: ['Clerk', 'Gujarat Govt']
  },
  {
    id: 'c191b8b0-92ce-4b82-8f37-79beee34ab3a',
    title: 'ISRO Technical Assistant',
    department: 'ISRO',
    source_id: '44444444-4444-4444-4444-444444444444',
    category: 'Engineering',
    eligibility: 'Diploma in Engineering',
    description: 'Technical Assistant posts at multiple ISRO centres.',
    apply_url: 'https://www.isro.gov.in/Careers.html',
    last_date: '2026-06-02',
    posted_date: '2026-05-21',
    final_year_eligible: true,
    trending: false,
    tags: ['Diploma', 'Technical']
  },
  {
    id: 'effcb5aa-c65d-4080-98f4-2a0c66a44e02',
    title: 'GPSC Civil Services 2026',
    department: 'Gujarat PSC',
    source_id: '22222222-2222-2222-2222-222222222222',
    category: 'Gujarat Govt',
    eligibility: 'Graduation, age 20-35',
    description: 'Class 1-2 Officers - Dy Collector, DySP, Mamlatdar etc.',
    apply_url: 'https://www.marugujarat.in/',
    last_date: '2026-07-05',
    posted_date: '2026-05-21',
    final_year_eligible: true,
    trending: true,
    tags: ['Civil Services', 'Class I', 'Gujarat Govt']
  }
];

async function seed() {
  console.log("Clearing existing jobs and sources...");
  await supabase.from('jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('sources').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log("Inserting sources...");
  for (const src of mockSources) {
    const { error } = await supabase.from('sources').upsert(src);
    if (error) console.error("Error source:", error.message);
  }

  console.log("Inserting jobs...");
  for (const job of mockJobs) {
    const { error } = await supabase.from('jobs').upsert(job);
    if (error) console.error("Error job:", error.message);
  }

  console.log("Seeding complete successfully!");
}

seed().catch(console.error);
