import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SubscribeForm } from "@/components/SubscribeForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CATEGORIES } from "@/lib/types";
import { toast } from "sonner";
import { Bell, Check } from "lucide-react";

const Alerts = () => {
  const { user } = useAuth();
  const [sub, setSub] = useState<{ id: string; categories: string[]; active: boolean } | null>(null);

  useEffect(() => {
    if (!user?.email) return;
    (async () => {
      const { data } = await supabase.from("email_subscriptions").select("*").eq("email", user.email!).maybeSingle();
      if (data) setSub({ id: data.id, categories: data.categories ?? [], active: data.active });
    })();
  }, [user]);

  const toggleCat = async (c: string) => {
    if (!sub) return;
    const next = sub.categories.includes(c) ? sub.categories.filter((x) => x !== c) : [...sub.categories, c];
    const { error } = await supabase.from("email_subscriptions").update({ categories: next }).eq("id", sub.id);
    if (error) { toast.error(error.message); return; }
    setSub({ ...sub, categories: next });
    toast.success("Preferences updated");
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary" /> Email Alerts
          </h1>
          <p className="text-muted-foreground">Configure your daily notification digest.</p>
        </div>

        {!sub ? (
          <SubscribeForm />
        ) : (
          <div className="glass rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-2 mb-1 text-success">
              <Check className="h-5 w-5" /> <span className="font-semibold">You're subscribed</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Receiving daily alerts at <strong className="text-foreground">{user?.email}</strong></p>

            <h3 className="font-display font-semibold mb-3">Filter categories</h3>
            <p className="text-sm text-muted-foreground mb-4">Select categories you want. Leave empty to receive all.</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {CATEGORIES.map((c) => {
                const on = sub.categories.includes(c);
                return (
                  <Button key={c} variant={on ? "hero" : "outline"} size="sm" onClick={() => toggleCat(c)}>
                    {on && <Check className="h-3 w-3 mr-1" />} {c}
                  </Button>
                );
              })}
            </div>
            <div className="text-xs text-muted-foreground glass rounded-lg p-3">
              💡 Alerts are scheduled to run daily at 8 AM IST. You'll only receive emails when there are new notifications matching your filters.
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Alerts;
