import { Job } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, ExternalLink, Building2, GraduationCap, Calendar, Flame } from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface Props {
  job: Job;
  bookmarked?: boolean;
  onToggleBookmark?: (id: string) => void;
}

const categoryColors: Record<string, string> = {
  "Tech Jobs": "from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-300",
  "Engineering": "from-violet-500/20 to-purple-500/20 border-violet-500/30 text-violet-300",
  "Police": "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300",
  "SSC": "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300",
  "Gujarat Govt": "from-pink-500/20 to-rose-500/20 border-pink-500/30 text-pink-300",
};

export const JobCard = ({ job, bookmarked, onToggleBookmark }: Props) => {
  const daysLeft = job.last_date ? differenceInDays(parseISO(job.last_date), new Date()) : null;
  const urgent = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0;
  const expired = daysLeft !== null && daysLeft < 0;
  const catColor = categoryColors[job.category] ?? "from-primary/20 to-accent/20 border-primary/30 text-primary";

  return (
    <article className="glass rounded-xl p-5 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:glow-primary group animate-fade-in-up">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r border", catColor)}>
              {job.category}
            </span>
            {job.trending && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-warning/15 border border-warning/40 text-warning flex items-center gap-1">
                <Flame className="h-3 w-3" /> Trending
              </span>
            )}
            {job.final_year_eligible && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-success/15 border border-success/40 text-success flex items-center gap-1">
                <GraduationCap className="h-3 w-3" /> Final Year OK
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {job.title}
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
            <Building2 className="h-3.5 w-3.5" /> {job.department}
          </p>
        </div>
        {onToggleBookmark && (
          <button
            onClick={() => onToggleBookmark(job.id)}
            className="p-2 rounded-lg hover:bg-secondary/60 transition-colors shrink-0"
            aria-label="Bookmark"
          >
            {bookmarked ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5 text-muted-foreground" />}
          </button>
        )}
      </div>

      {job.eligibility && (
        <p className="text-sm text-muted-foreground/90 mb-3 line-clamp-2">
          <span className="text-foreground/80 font-medium">Eligibility: </span>{job.eligibility}
        </p>
      )}

      {job.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.tags.slice(0, 4).map((t) => (
            <Badge key={t} variant="outline" className="text-[10px] font-normal bg-secondary/40">{t}</Badge>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/50">
        <div className="text-xs">
          {job.last_date ? (
            expired ? (
              <span className="text-destructive font-medium flex items-center gap-1"><Calendar className="h-3 w-3" /> Closed</span>
            ) : (
              <span className={cn("flex items-center gap-1 font-medium", urgent ? "text-warning" : "text-muted-foreground")}>
                <Calendar className="h-3 w-3" />
                {daysLeft} days left · {format(parseISO(job.last_date), "dd MMM")}
              </span>
            )
          ) : (
            <span className="text-muted-foreground">Date TBA</span>
          )}
        </div>
        <Button asChild size="sm" variant="hero" className="h-8">
          <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
            Apply <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </Button>
      </div>
    </article>
  );
};
