import { Link } from "react-router-dom";

export default function ForumPageHeader({
  theme,
  backTo,
  backLabel = "← Back to forum",
  title,
  subtitle,
  meta,
  badge,
  action,
}) {
  return (
    <section className="w-full text-white py-10 sm:py-12 lg:py-16 px-4" style={{ backgroundColor: theme.bg, color: theme.text }}>
      <div className="max-w-[1400px] mx-auto">
        {backTo && (
          <Link
            to={backTo}
            className="text-xs font-bold uppercase tracking-widest opacity-70 hover:opacity-100"
          >
            {backLabel}
          </Link>
        )}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mt-4">
          <div>
            {badge && (
              <span
                className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 mb-3"
                style={{ backgroundColor: theme.badge, color: theme.badgeText }}
              >
                {badge}
              </span>
            )}
            <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight m-0">
              {title}
            </h1>
            {subtitle && <p className="text-sm mt-2 m-0 opacity-80 max-w-xl">{subtitle}</p>}
            {meta && <p className="text-sm mt-2 m-0 opacity-70">{meta}</p>}
          </div>
          {action}
        </div>
      </div>
    </section>
  );
}
