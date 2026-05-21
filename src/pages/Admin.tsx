import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Source, CATEGORIES } from "@/lib/types";
import { toast } from "sonner";
import { Plus, Trash2, Database, Briefcase, RefreshCw } from "lucide-react";

const Admin = () => {
  const { isAdmin, loading } = useAuth();
  const [sources, setSources] = useState<Source[]>([]);
  const [jobCount, setJobCount] = useState(0);
  const [subCount, setSubCount] = useState(0);
  const [form, setForm] = useState({ title: "", department: "", category: CATEGORIES[0] as string, apply_url: "", last_date: "", eligibility: "" });

  const load = async () => {
    const [{ data: srcs }, { count: jc }, { count: sc }] = await Promise.all([
      supabase.from("sources").select("*").order("name"),
      supabase.from("jobs").select("id", { count: "exact", head: true }),
      supabase.from("email_subscriptions").select("id", { count: "exact", head: true }),
    ]);
    setSources(srcs ?? []);
    setJobCount(jc ?? 0);
    setSubCount(sc ?? 0);
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  if (loading) return <div className="min-h-screen grid place-items-center">Loading…</div>;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const addJob = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("jobs").insert({
      ...form,
      last_date: form.last_date || null,
      tags: [],
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Job added");
    setForm({ title: "", department: "", category: CATEGORIES[0], apply_url: "", last_date: "", eligibility: "" });
    load();
  };

  const simulateCron = async () => {
    toast.loading("Simulating daily cron sync…", { id: "cron" });
    await new Promise((r) => setTimeout(r, 1200));
    toast.success("Daily sync complete — 0 new notifications", { id: "cron" });
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Manage sources, notifications and subscribers.</p>
          </div>
          <Button variant="hero" onClick={simulateCron}><RefreshCw className="h-4 w-4" /> Run daily sync</Button>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Briefcase, label: "Total Jobs", val: jobCount },
            { icon: Database, label: "Sources", val: sources.length },
            { icon: Plus, label: "Subscribers", val: subCount },
          ].map((s) => (
            <div key={s.label} className="glass rounded-xl p-5">
              <s.icon className="h-5 w-5 text-primary mb-2" />
              <div className="text-3xl font-display font-bold">{s.val}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass rounded-xl p-6">
            <h2 className="font-display text-xl font-bold mb-4">Add New Notification</h2>
            <form onSubmit={addJob} className="space-y-3">
              <div><Label>Title</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Department</Label><Input required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
                <div>
                  <Label>Category</Label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full h-10 rounded-md bg-background/60 border border-input px-3 text-sm">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div><Label>Apply URL</Label><Input type="url" required value={form.apply_url} onChange={(e) => setForm({ ...form, apply_url: e.target.value })} /></div>
              <div><Label>Last Date</Label><Input type="date" value={form.last_date} onChange={(e) => setForm({ ...form, last_date: e.target.value })} /></div>
              <div><Label>Eligibility</Label><Textarea rows={2} value={form.eligibility} onChange={(e) => setForm({ ...form, eligibility: e.target.value })} /></div>
              <Button type="submit" variant="hero" className="w-full"><Plus className="h-4 w-4" /> Add Notification</Button>
            </form>
          </div>

          <div className="glass rounded-xl p-6">
            <h2 className="font-display text-xl font-bold mb-4">Tracked Sources</h2>
            <div className="space-y-2">
              {sources.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/40 border border-border">
                  <div className="min-w-0">
                    <div className="font-semibold">{s.name}</div>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary truncate block">{s.url}</a>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${s.active ? "bg-success/15 text-success border border-success/30" : "bg-muted text-muted-foreground"}`}>
                    {s.active ? "Active" : "Off"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
