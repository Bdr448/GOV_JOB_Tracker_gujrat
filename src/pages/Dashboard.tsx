import { useEffect, useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { JobCard } from "@/components/JobCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Job, CATEGORIES } from "@/lib/types";
import { Search, Inbox } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props { mode?: "all" | "trending" | "bookmarks" }

const Dashboard = ({ mode = "all" }: Props) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let query = supabase.from("jobs").select("*").order("posted_date", { ascending: false });
      if (mode === "trending") query = query.eq("trending", true);
      const { data: jobsData, error } = await query;
      if (error) toast.error(error.message);

      const { data: bms } = await supabase.from("bookmarks").select("job_id").eq("user_id", user!.id);
      const bmSet = new Set((bms ?? []).map((b) => b.job_id));
      setBookmarks(bmSet);

      let list = (jobsData ?? []) as Job[];
      if (mode === "bookmarks") list = list.filter((j) => bmSet.has(j.id));
      setJobs(list);
      setLoading(false);
    })();
  }, [user, mode]);

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      const matchQ = !q || j.title.toLowerCase().includes(q.toLowerCase()) || j.department.toLowerCase().includes(q.toLowerCase());
      const matchC = !cat || j.category === cat;
      return matchQ && matchC;
    });
  }, [jobs, q, cat]);

  const toggleBookmark = async (jobId: string) => {
    if (bookmarks.has(jobId)) {
      await supabase.from("bookmarks").delete().eq("user_id", user!.id).eq("job_id", jobId);
      const next = new Set(bookmarks); next.delete(jobId); setBookmarks(next);
      toast.success("Removed from bookmarks");
      if (mode === "bookmarks") setJobs(jobs.filter((j) => j.id !== jobId));
    } else {
      const { error } = await supabase.from("bookmarks").insert({ user_id: user!.id, job_id: jobId });
      if (error) { toast.error(error.message); return; }
      setBookmarks(new Set([...bookmarks, jobId]));
      toast.success("Bookmarked!");
    }
  };

  const title = mode === "trending" ? "🔥 Trending Jobs" : mode === "bookmarks" ? "🔖 Your Bookmarks" : "Latest Notifications";
  const subtitle = mode === "trending" ? "Most popular notifications right now"
    : mode === "bookmarks" ? "Jobs you've saved for later"
    : "Fresh exam & job notifications updated daily";

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">{title}</h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>

        <div className="glass rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-3 sticky top-16 z-20">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by exam, department…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 bg-background/40 border-border/60" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            <Button size="sm" variant={!cat ? "hero" : "outline"} onClick={() => setCat(null)} className="shrink-0">All</Button>
            {CATEGORIES.map((c) => (
              <Button
                key={c}
                size="sm"
                variant={cat === c ? "hero" : "outline"}
                onClick={() => setCat(cat === c ? null : c)}
                className={cn("shrink-0", cat === c && "")}
              >
                {c}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass rounded-xl p-5 space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-display text-xl font-semibold mb-2">No notifications found</h3>
            <p className="text-muted-foreground text-sm">{mode === "bookmarks" ? "Start bookmarking jobs to see them here." : "Try a different filter or search term."}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((j) => (
              <JobCard key={j.id} job={j} bookmarked={bookmarks.has(j.id)} onToggleBookmark={toggleBookmark} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
