import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { TROPHY_IMAGE } from "../../constants/assets.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/news", label: "News" },
  { to: "/fixtures", label: "Fixtures" },
  { to: "/standings", label: "Standings" },
  { to: "/predictions", label: "Predictions" },
  { to: "/forum", label: "Forum" },
];

function SiteLogo({ className = "" }) {
  return (
    <img
      src={TROPHY_IMAGE}
      alt="World Cup Predictor"
      className={`object-contain shrink-0 ${className}`}
    />
  );
}

function GearIcon({ className = "w-5 h-5" }) {
  return (
    <svg
      className={`text-white shrink-0 ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function AccountMenu({ className = "", onNavigate }) {
  const { isAuthenticated, logout } = useAuth();

  if (isAuthenticated) {
    return (
      <div className={`flex items-center gap-1 sm:gap-2 shrink-0 ${className}`}>
        <Link
          to="/profile"
          onClick={onNavigate}
          className="group flex items-center justify-center min-h-[2.75rem] min-w-[2.75rem] px-2 text-[11px] sm:text-xs font-semibold tracking-wide uppercase text-white hover:opacity-90 transition-all"
          aria-label="Account"
          title="Account"
        >
          <GearIcon />
          <span className="hidden group-hover:inline group-focus-visible:inline ml-2 whitespace-nowrap">
            Account
          </span>
        </Link>
        <button
          type="button"
          onClick={() => {
            logout();
            onNavigate?.();
          }}
          className="hidden sm:inline text-[10px] font-bold uppercase tracking-wide text-white/60 hover:text-white px-2"
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <Link
      to="/login"
      onClick={onNavigate}
      className={`flex items-center justify-center min-h-[2.75rem] px-3 text-[11px] sm:text-xs font-semibold tracking-wide uppercase hover:opacity-80 shrink-0 ${className}`}
    >
      Sign in
    </Link>
  );
}

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex items-center justify-center min-h-[2.75rem] min-w-[2.75rem] p-1 text-white/90 hover:text-white transition-opacity shrink-0"
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

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("mobile-nav-open", menuOpen);
    return () => document.body.classList.remove("mobile-nav-open");
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const navClass = ({ isActive }) =>
    `nav-link-hover flex items-center min-h-[3rem] px-1 text-sm sm:text-xs font-semibold tracking-wide whitespace-nowrap transition-opacity hover:opacity-100 ${
      isActive ? "nav-link-active opacity-100" : "opacity-90"
    }`;

  return (
    <header className="font-sans sticky top-0 z-50 bg-black text-white border-b border-white/10 safe-top">
      <nav>
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 min-h-14 py-2 flex items-center gap-3 lg:gap-6 relative">
          <button
            type="button"
            className="lg:hidden flex items-center justify-center min-h-[2.75rem] min-w-[2.75rem] text-white shrink-0 -ml-1"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center shrink-0 hover:opacity-90 transition-opacity"
          >
            <SiteLogo className="h-9 sm:h-10 w-auto max-w-[2.75rem]" />
          </Link>

          <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest text-white/80 truncate max-w-[8rem] lg:max-w-none">
            WC Predictor
          </span>

          <div className="hidden lg:flex items-center gap-5 xl:gap-6 ml-4 xl:ml-6 overflow-x-auto">
            {NAV_LINKS.map(({ to, label, end }) => (
              <NavLink key={label} to={to} end={end} className={navClass}>
                {label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-1 sm:gap-3 ml-auto shrink-0">
            <ThemeToggle />
            <AccountMenu onNavigate={closeMenu} />
          </div>
        </div>

        {menuOpen && (
          <button
            type="button"
            className="lg:hidden fixed inset-0 top-14 z-30 bg-black/60 backdrop-blur-[2px]"
            aria-label="Close menu"
            onClick={closeMenu}
          />
        )}

        <div
          className={`lg:hidden absolute left-0 right-0 top-full z-40 bg-black border-b border-white/10 shadow-xl transition-all duration-200 origin-top ${
            menuOpen
              ? "opacity-100 scale-y-100 pointer-events-auto"
              : "opacity-0 scale-y-95 pointer-events-none h-0 overflow-hidden"
          }`}
        >
          <div className="px-4 py-3 flex flex-col">
            {NAV_LINKS.map(({ to, label, end }) => (
              <NavLink
                key={label}
                to={to}
                end={end}
                className={navClass}
                onClick={closeMenu}
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
