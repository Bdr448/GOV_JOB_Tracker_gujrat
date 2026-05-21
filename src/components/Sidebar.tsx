import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Bookmark, Bell, Shield, Home, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home", icon: Home, public: true },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/trending", label: "Trending", icon: Sparkles },
  { to: "/dashboard/bookmarks", label: "Bookmarks", icon: Bookmark },
  { to: "/dashboard/alerts", label: "Email Alerts", icon: Bell },
];

export const Sidebar = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { isAdmin } = useAuth();
  const { pathname } = useLocation();
  return (
    <aside className="h-full w-64 glass-strong border-r border-sidebar-border flex flex-col">
      <div className="px-6 py-5 border-b border-sidebar-border">
        <NavLink to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-primary grid place-items-center font-display font-bold text-primary-foreground glow-primary">
            G
          </div>
          <span className="font-display font-bold text-lg">GovTech</span>
        </NavLink>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-gradient-primary text-primary-foreground shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.5)]"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          );
        })}
        {isAdmin && (
          <NavLink
            to="/admin"
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mt-4 border-t border-sidebar-border pt-4",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )
            }
          >
            <Shield className="h-4 w-4" /> Admin
          </NavLink>
        )}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <div className="glass rounded-lg p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1">📬 Daily Alerts</p>
          <p>New notifications delivered to your inbox every morning.</p>
        </div>
      </div>
    </aside>
  );
};
