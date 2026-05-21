import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SubscribeForm } from "@/components/SubscribeForm";
import { ArrowRight, Bell, Bookmark, Filter, Sparkles, ShieldCheck, Zap, Building2, Mail, GraduationCap } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { useAuth } from "@/hooks/useAuth";

const features = [
  { icon: Bell, title: "Daily Email Alerts", desc: "Wake up to fresh notifications from OJAS, GPSC, SSC and ISRO every morning." },
  { icon: Filter, title: "Smart Filters", desc: "Filter by Tech, Engineering, Police, SSC or Gujarat Govt. Find what fits you." },
  { icon: Bookmark, title: "Save & Track", desc: "Bookmark jobs you care about and track deadlines with live countdowns." },
  { icon: GraduationCap, title: "Final-Year Friendly", desc: "Clearly tagged jobs that accept final-year students. No guesswork." },
  { icon: ShieldCheck, title: "Official Sources Only", desc: "Every link points straight to the official notification. Zero spam." },
  { icon: Zap, title: "Real-Time Updates", desc: "Notifications tracked daily, the moment they're published." },
];

const sources = ["OJAS Gujarat", "GPSC", "SSC", "ISRO"];
const stats = [
  { label: "Active Notifications", value: "120+" },
  { label: "Subscribers", value: "8K+" },
  { label: "Official Sources", value: "4" },
  { label: "Daily Alerts Sent", value: "10K" },
];

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-50 glass-strong border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-primary grid place-items-center font-display font-bold text-primary-foreground glow-primary">G</div>
            <span className="font-display font-bold text-lg">GovTech Alerts</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">Features</a>
            <a href="#sources" className="hover:text-foreground transition">Sources</a>
            <a href="#subscribe" className="hover:text-foreground transition">Subscribe</a>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Button asChild variant="hero" size="sm"><Link to="/dashboard">Dashboard <ArrowRight className="h-4 w-4" /></Link></Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm"><Link to="/auth">Sign in</Link></Button>
                <Button asChild variant="hero" size="sm"><Link to="/auth">Get Started</Link></Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-90 -z-10" />
        <div className="container py-16 md:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-semibold mb-6">
              <Sparkles className="h-3 w-3 text-primary" />
              <span>Trusted by 8,000+ aspirants across India</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.05] mb-6">
              Every Indian Govt <span className="text-gradient">exam & job</span><br />
              in your inbox.
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl">
              GovTech Alerts tracks <strong className="text-foreground">OJAS, GPSC, SSC and ISRO</strong> every single day —
              so you never miss a notification, deadline or dream job again.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button asChild variant="hero" size="lg" className="h-12 px-7">
                <Link to={user ? "/dashboard" : "/auth"}>Start tracking free <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="glass" size="lg" className="h-12 px-7">
                <a href="#features">How it works</a>
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-3 max-w-md">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-xl md:text-2xl font-display font-bold text-gradient">{s.value}</div>
                  <div className="text-[10px] md:text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            <div className="absolute -inset-6 bg-gradient-primary opacity-20 blur-3xl rounded-full" />
            <img
              src={hero}
              alt="Futuristic dashboard showing Indian government job notifications"
              className="relative rounded-2xl border border-white/10 shadow-elevated animate-float"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* Sources */}
      <section id="sources" className="container py-16">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">Tracking official sources</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sources.map((s) => (
            <div key={s} className="glass rounded-xl p-6 text-center hover:border-primary/40 transition">
              <Building2 className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="font-display font-semibold">{s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container py-20">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">Built for <span className="text-gradient-accent">aspirants</span></h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Everything you need to land your dream government job — without scrolling 12 websites a day.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass rounded-xl p-6 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 group">
              <div className="h-12 w-12 rounded-lg bg-gradient-primary grid place-items-center mb-4 group-hover:scale-110 transition">
                <Icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Subscribe */}
      <section id="subscribe" className="container py-20">
        <SubscribeForm />
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-10">
        <div className="container py-10 grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center font-display font-bold text-primary-foreground">G</div>
              <span className="font-display font-bold">GovTech Alerts</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              An independent service for Indian government exam & job aspirants. Not affiliated with any government body.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Official Sources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="https://ojas.gujarat.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-primary">OJAS Gujarat</a></li>
              <li><a href="https://gpsc.gujarat.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-primary">GPSC</a></li>
              <li><a href="https://ssc.nic.in" target="_blank" rel="noopener noreferrer" className="hover:text-primary">SSC</a></li>
              <li><a href="https://www.isro.gov.in/Careers.html" target="_blank" rel="noopener noreferrer" className="hover:text-primary">ISRO Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/dashboard" className="hover:text-primary">Dashboard</Link></li>
              <li><Link to="/auth" className="hover:text-primary">Sign in</Link></li>
              <li><a href="#subscribe" className="hover:text-primary flex items-center gap-1"><Mail className="h-3 w-3" /> Email Alerts</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} GovTech Alerts · Made for India's aspirants
        </div>
      </footer>
    </div>
  );
};

export default Index;
