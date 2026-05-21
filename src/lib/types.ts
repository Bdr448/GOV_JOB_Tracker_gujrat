export interface Job {
  id: string;
  title: string;
  department: string;
  source_id: string | null;
  category: string;
  eligibility: string | null;
  description: string | null;
  apply_url: string;
  last_date: string | null;
  posted_date: string;
  final_year_eligible: boolean;
  trending: boolean;
  tags: string[];
  created_at: string;
}

export interface Source {
  id: string;
  name: string;
  url: string;
  description: string | null;
  active: boolean;
}

export const CATEGORIES = ["Tech Jobs", "Engineering", "Police", "SSC", "Gujarat Govt"] as const;
export type Category = typeof CATEGORIES[number];
