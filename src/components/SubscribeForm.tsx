import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, Sparkles } from "lucide-react";
import { z } from "zod";

const schema = z.object({ email: z.string().trim().email("Enter a valid email").max(255) });

export const SubscribeForm = ({ compact = false }: { compact?: boolean }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setLoading(true);
    const { error } = await supabase
      .from("email_subscriptions")
      .insert({ email: parsed.data.email, categories: [] });
    setLoading(false);
    if (error) {
      if (error.code === "23505") toast.success("You're already subscribed!");
      else toast.error(error.message);
      return;
    }
    toast.success("Subscribed! Daily alerts incoming.");
    setEmail("");
  };

  return (
    <form onSubmit={submit} className={compact ? "flex gap-2" : "glass rounded-2xl p-6 md:p-8 max-w-2xl mx-auto"}>
      {!compact && (
        <div className="mb-5 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-3">
            <Sparkles className="h-3 w-3" /> Daily Email Alerts
          </div>
          <h3 className="text-2xl md:text-3xl font-display font-bold mb-2">Never miss a notification</h3>
          <p className="text-muted-foreground">Get all new exam & job notifications in your inbox every morning.</p>
        </div>
      )}
      <div className={compact ? "flex gap-2 w-full" : "flex flex-col sm:flex-row gap-2"}>
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-9 h-11 bg-background/60"
            required
          />
        </div>
        <Button type="submit" variant="hero" size="lg" disabled={loading}>
          {loading ? "..." : "Subscribe"}
        </Button>
      </div>
    </form>
  );
};
