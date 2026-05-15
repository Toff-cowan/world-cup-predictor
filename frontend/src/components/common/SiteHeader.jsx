import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext.jsx";

const NAV_LINKS = [
  { to: "/", label: "HOME", end: true },
  { to: "/standings", label: "STANDINGS" },
  { to: "/predictions", label: "MY PREDICTIONS" },
  { to: "/", label: "NEWS" },
];

function LogoPlaceholder({ className = "" }) {
  return (
    <div
      className={`flex items-center justify-center border border-dashed border-white/30 bg-white/5 text-white/40 text-[10px] font-semibold uppercase tracking-wider shrink-0 ${className}`}
      aria-label="Logo placeholder"
    >
      Logo
    </div>
  );
}

function AccountButton({ className = "" }) {
  return (
    <Link
      to="/profile"
      className={`flex items-center gap-2 text-[11px] sm:text-xs font-semibold tracking-wide uppercase hover:opacity-80 shrink-0 ${className}`}
      aria-label="Account"
    >
      <svg className="w-5 h-5 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 12c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4zm0 2c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4z" />
      </svg>
      <span className="hidden sm:inline">Account</span>
    </Link>
  );
}

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-1 text-white/90 hover:text-white transition-opacity shrink-0"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}

function HeaderActions({ countdownHidden, onShowCountdown, className = "" }) {
  return (
    <div className={`flex items-center gap-4 shrink-0 ${className}`}>
      {countdownHidden && onShowCountdown && (
        <button
          type="button"
          onClick={onShowCountdown}
          className="text-[11px] font-semibold uppercase tracking-wide text-white/80 hover:text-white whitespace-nowrap"
        >
          Show timer
        </button>
      )}
      <ThemeToggle />
      <AccountButton />
    </div>
  );
}

export default function SiteHeader({ onShowCountdown, countdownHidden }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navClass = ({ isActive }) =>
    `text-[11px] sm:text-xs font-semibold tracking-wide whitespace-nowrap transition-opacity hover:opacity-80 ${
      isActive ? "opacity-100 underline underline-offset-4 decoration-2" : "opacity-90"
    }`;

  return (
    <header className="font-sans sticky top-0 z-50 bg-black text-white border-b border-white/10">
      <nav>
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 min-h-14 py-2 flex items-center gap-4 lg:gap-6 relative flex-wrap">
          <button
            type="button"
            className="lg:hidden text-white p-1 shrink-0"
            aria-label="Menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link to="/" className="flex items-center shrink-0">
            <LogoPlaceholder className="h-10 w-14 rounded" />
          </Link>

          <div
            className={`${
              menuOpen ? "flex" : "hidden"
            } lg:flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 w-full lg:w-auto absolute lg:static top-full left-0 right-0 bg-black lg:bg-transparent p-4 lg:p-0 border-b lg:border-0 border-white/10 z-40`}
          >
            {NAV_LINKS.map(({ to, label, end }) => (
              <NavLink
                key={label}
                to={to}
                end={end}
                className={navClass}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </NavLink>
            ))}
          </div>

          <HeaderActions
            className="ml-auto"
            countdownHidden={countdownHidden}
            onShowCountdown={onShowCountdown}
          />
        </div>
      </nav>
    </header>
  );
}
