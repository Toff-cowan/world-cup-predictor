import { Link, NavLink } from "react-router-dom";
import { TROPHY_IMAGE } from "../../constants/assets.js";
import ExternalSiteLink from "./ExternalSiteLink.jsx";

const CREATOR_URL = "https://toff-industries.com/";
const FIFA_WC_URL =
  "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026";
const FIFA_HOME = "https://www.fifa.com/en";

const FOOTER_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/news", label: "News" },
  { to: "/fixtures", label: "Fixtures" },
  { to: "/standings", label: "Standings" },
  { to: "/predictions", label: "Predictions" },
  { to: "/forum", label: "Forum" },
];

export default function SiteFooter() {
  return (
    <footer className="font-sans bg-black text-white border-t border-white/10 mt-auto">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12 lg:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          <div>
            <Link to="/" className="inline-flex items-center gap-3 hover:opacity-90 transition-opacity">
              <img src={TROPHY_IMAGE} alt="" className="h-10 w-auto" />
              <span className="text-sm font-bold uppercase tracking-widest">World Cup Predictor</span>
            </Link>
            <p className="text-sm text-white/60 mt-4 m-0 leading-relaxed max-w-sm">
              Fan-built bracket tool for FIFA World Cup 2026™. Match data and news are sourced from
              public FIFA APIs — not an official FIFA product.
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 m-0 mb-4">
              Explore
            </p>
            <ul className="space-y-2.5 list-none m-0 p-0">
              {FOOTER_LINKS.map(({ to, label, end }) => (
                <li key={label}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `text-sm transition-colors hover:underline underline-offset-4 ${
                        isActive ? "text-white font-semibold" : "text-white/80 hover:text-white"
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 m-0 mb-4">
              Official source
            </p>
            <ExternalSiteLink
              href={FIFA_WC_URL}
              hint="fifa.com · World Cup 2026"
              className="text-sm font-semibold text-[#7eb3ff] hover:text-[#a8cbff]"
            >
              FIFA World Cup 2026™ on FIFA.com →
            </ExternalSiteLink>
            <p className="text-xs text-white/45 mt-4 m-0 leading-relaxed">
              Schedules, tickets, and verified news on{" "}
              <ExternalSiteLink
                href={FIFA_HOME}
                hint="fifa.com"
                showArrow={false}
                className="text-white/70 hover:text-white underline underline-offset-2"
              >
                fifa.com
              </ExternalSiteLink>
              .
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 m-0 mb-4">
              Creator
            </p>
            <ExternalSiteLink
              href={CREATOR_URL}
              hint="toff-industries.com"
              className="text-sm font-semibold text-[#7eb3ff] hover:text-[#a8cbff]"
            >
              Christoff Cowan · Toff Industries →
            </ExternalSiteLink>
            <p className="text-xs text-white/45 mt-4 m-0 leading-relaxed">
              Built by{" "}
              <ExternalSiteLink
                href={CREATOR_URL}
                hint="toff-industries.com"
                showArrow={false}
                className="text-white/70 hover:text-white underline underline-offset-2"
              >
                Christoff Cowan
              </ExternalSiteLink>
              . View portfolio, projects, and services at toff-industries.com.
            </p>
          </div>
        </div>

        <div
          className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-white/40"
        >
          <p className="m-0">
            © {new Date().getFullYear()} World Cup Predictor · Fan project ·{" "}
            <ExternalSiteLink
              href={CREATOR_URL}
              hint="toff-industries.com"
              showArrow={false}
              className="text-white/60 hover:text-white underline underline-offset-2"
            >
              toff-industries.com
            </ExternalSiteLink>
          </p>
          <p className="m-0">USA · Canada · Mexico 2026</p>
        </div>
      </div>
    </footer>
  );
}
