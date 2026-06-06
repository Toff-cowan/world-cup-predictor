import { Link } from "react-router-dom";

const base =
  "inline-flex items-center justify-center font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950";

function tabClasses(active) {
  return active
    ? `${base} px-4 py-2 text-xs uppercase tracking-wide border bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-800 dark:text-white dark:border-white focus-visible:ring-zinc-900 dark:focus-visible:ring-white`
    : `${base} px-4 py-2 text-xs uppercase tracking-wide border bg-white text-zinc-600 border-zinc-300 hover:border-zinc-900 dark:bg-zinc-900 dark:text-white dark:border-zinc-600 dark:hover:border-white dark:hover:text-white focus-visible:ring-zinc-400`;
}

const variants = {
  primary: `${base} px-8 py-3 text-sm bg-white text-black hover:bg-zinc-100 focus-visible:ring-white/60 dark:bg-[#0047FF] dark:text-white dark:hover:bg-[#3366ff] dark:focus-visible:ring-[#0047FF]/50`,
  outline: `${base} gap-2 px-5 py-2.5 text-xs uppercase tracking-wide border border-white/35 text-white hover:bg-white/10 focus-visible:ring-white/40 dark:border-white/55 dark:hover:bg-white/15 dark:hover:border-white/80`,
  link: `${base} text-sm font-semibold underline underline-offset-4 text-zinc-900 hover:text-zinc-600 dark:text-white dark:hover:text-white bg-transparent px-0 py-0 min-h-0 focus-visible:ring-zinc-400`,
  ghost: `${base} text-xs uppercase tracking-wide text-zinc-700 hover:text-zinc-900 dark:text-white dark:hover:text-white bg-transparent px-0 py-0 min-h-0`,
};

/**
 * Homepage buttons/links with light + dark styles.
 * @param {"primary"|"outline"|"link"|"ghost"|"tab"} variant
 * @param {"button"|"link"|"a"} as
 */
export default function HomeButton({
  variant = "primary",
  active = false,
  as = "button",
  to,
  href,
  className = "",
  children,
  ...props
}) {
  const classes =
    variant === "tab"
      ? `${tabClasses(active)} ${className}`.trim()
      : `${variants[variant] || variants.primary} ${className}`.trim();

  if (as === "link" && to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  if (as === "a" && href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
