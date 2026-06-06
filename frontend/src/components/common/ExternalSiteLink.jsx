function siteLabel(href) {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
}

/**
 * External link with hover tooltip (site name + opens in new tab).
 */
export default function ExternalSiteLink({
  href,
  children,
  className = "",
  hint,
  showArrow = true,
  tooltip = true,
}) {
  const label = hint || siteLabel(href);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative inline-flex items-center gap-1 external-site-link ${className}`}
    >
      <span>{children}</span>
      {showArrow && (
        <span
          aria-hidden
          className="opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200"
        >
          ↗
        </span>
      )}
      {tooltip && (
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-0 mb-2 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap bg-zinc-900 text-white dark:bg-zinc-800 dark:text-white opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0 transition-all duration-200 z-30 shadow-lg rounded-sm"
        >
          {label}
          <span className="block normal-case font-normal tracking-normal text-white/70 dark:text-white text-[9px] mt-0.5">
            Opens in new tab
          </span>
        </span>
      )}
    </a>
  );
}
