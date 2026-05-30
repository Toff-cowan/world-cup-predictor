import { forwardRef } from "react";
import { matchKey } from "../../constants/bracket.js";
import { teamById } from "../../utils/bracketHelpers.js";
import {
  LEFT_QF,
  LEFT_R16,
  LEFT_R32,
  LEFT_SF,
  RIGHT_QF,
  RIGHT_R16,
  RIGHT_R32,
  RIGHT_SF,
  teamSeedLabel,
} from "../../utils/knockoutBracketLayout.js";
import TeamFlag from "../standings/TeamFlag.jsx";
import { TROPHY_IMAGE } from "../../constants/assets.js";

function getMatch(knockout, roundKey, index) {
  return (
    knockout[roundKey]?.[matchKey(index)] || {
      home: null,
      away: null,
      winner: null,
    }
  );
}

function TeamRow({ team, seed, winner, mirrored }) {
  return (
    <div
      className={`flex items-center gap-2 px-2.5 py-2 border-b border-zinc-200 last:border-0 ${
        winner ? "bg-zinc-100" : ""
      } ${mirrored ? "flex-row-reverse text-right" : ""}`}
    >
      <span className="text-[10px] text-zinc-400 w-7 shrink-0 tabular-nums">{seed}</span>
      {team ? (
        <>
          {!mirrored && (
            <TeamFlag
              flagUrl={team.flag_url}
              countryCode={team.country_code}
              teamCode={team.code}
              className="w-7 h-5 shrink-0"
            />
          )}
          <span className="text-[11px] font-bold uppercase tracking-wide truncate text-zinc-900">
            {team.name}
          </span>
          {mirrored && (
            <TeamFlag
              flagUrl={team.flag_url}
              countryCode={team.country_code}
              teamCode={team.code}
              className="w-7 h-5 shrink-0"
            />
          )}
        </>
      ) : (
        <span className="text-[11px] text-zinc-400 uppercase">TBD</span>
      )}
    </div>
  );
}

function R32MatchBox({ match, teams, groups, mirrored }) {
  const homeTeam = teamById(teams, match.home);
  const awayTeam = teamById(teams, match.away);

  return (
    <div className="w-44 xl:w-48 bg-white border border-zinc-200 rounded-lg overflow-hidden shrink-0">
      <TeamRow
        team={homeTeam}
        seed={teamSeedLabel(match.home, groups, teams)}
        winner={match.winner === match.home}
        mirrored={mirrored}
      />
      <TeamRow
        team={awayTeam}
        seed={teamSeedLabel(match.away, groups, teams)}
        winner={match.winner === match.away}
        mirrored={mirrored}
      />
    </div>
  );
}

function FlagNode({ team, large = false }) {
  const size = large ? "w-14 h-10" : "w-10 h-7";
  if (!team) {
    return (
      <div
        className={`${size} rounded-md border border-zinc-200 bg-zinc-50 shrink-0`}
        aria-hidden
      />
    );
  }
  return (
    <TeamFlag
      flagUrl={team.flag_url}
      countryCode={team.country_code}
      teamCode={team.code}
      className={`${size} shrink-0 rounded-md overflow-hidden`}
    />
  );
}

function Connector({ mirrored }) {
  return (
    <div
      className={`w-6 xl:w-8 shrink-0 self-stretch flex items-center ${
        mirrored ? "justify-end" : "justify-start"
      }`}
      aria-hidden
    >
      <div
        className={`h-[55%] w-1/2 border-zinc-300 ${
          mirrored ? "border-l border-t border-b" : "border-r border-t border-b"
        }`}
      />
    </div>
  );
}

function RoundColumn({ children, label, mirrored }) {
  return (
    <div className="flex flex-col items-center shrink-0">
      <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-400 mb-3 whitespace-nowrap">
        {label}
      </span>
      <div
        className={`flex flex-col justify-around flex-1 min-h-[520px] xl:min-h-[600px] gap-4 ${
          mirrored ? "items-end" : "items-start"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function BracketHalf({ side, knockout, teams, groups }) {
  const mirrored = side === "right";
  const r32Indices = side === "left" ? LEFT_R32 : RIGHT_R32;
  const r16Indices = side === "left" ? LEFT_R16 : RIGHT_R16;
  const qfIndices = side === "left" ? LEFT_QF : RIGHT_QF;
  const sfIndex = side === "left" ? LEFT_SF : RIGHT_SF;

  const r32Pairs = [];
  for (let i = 0; i < r32Indices.length; i += 2) {
    r32Pairs.push([r32Indices[i], r32Indices[i + 1]]);
  }

  return (
    <div className={`flex items-stretch ${mirrored ? "flex-row-reverse" : ""}`}>
      <RoundColumn label="Round of 32" mirrored={mirrored}>
        {r32Pairs.map(([a, b]) => (
          <div key={`${a}-${b}`} className="flex flex-col gap-1">
            <R32MatchBox
              match={getMatch(knockout, "round_of_32", a)}
              teams={teams}
              groups={groups}
              mirrored={mirrored}
            />
            <R32MatchBox
              match={getMatch(knockout, "round_of_32", b)}
              teams={teams}
              groups={groups}
              mirrored={mirrored}
            />
          </div>
        ))}
      </RoundColumn>

      <Connector mirrored={mirrored} />

      <RoundColumn label="Round of 16" mirrored={mirrored}>
        {r16Indices.map((idx) => {
          const match = getMatch(knockout, "round_of_16", idx);
          const team = teamById(teams, match.winner);
          return <FlagNode key={idx} team={team} />;
        })}
      </RoundColumn>

      <Connector mirrored={mirrored} />

      <RoundColumn label="Quarter-finals" mirrored={mirrored}>
        {qfIndices.map((idx) => {
          const match = getMatch(knockout, "quarter_final", idx);
          const team = teamById(teams, match.winner);
          return <FlagNode key={idx} team={team} />;
        })}
      </RoundColumn>

      <Connector mirrored={mirrored} />

      <RoundColumn label="Semi-finals" mirrored={mirrored}>
        <FlagNode team={teamById(teams, getMatch(knockout, "semi_final", sfIndex).winner)} />
      </RoundColumn>
    </div>
  );
}

const KnockoutBracketView = forwardRef(function KnockoutBracketView(
  { knockout, teams, groups, bracketName },
  ref
) {
  const finalMatch = getMatch(knockout, "final", 1);
  const finalistHome = teamById(teams, finalMatch.home);
  const finalistAway = teamById(teams, finalMatch.away);
  const champion = teamById(teams, finalMatch.winner);

  return (
    <section className="bg-white text-zinc-900 border border-zinc-200 pb-6 sm:pb-10">
      <p className="mobile-scroll-hint px-4 pt-3 mb-0 md:hidden">Swipe sideways to view full bracket →</p>
      <div className="mobile-scroll-x">
      <div
        ref={ref}
        data-bracket-export
        className="min-w-[1100px] xl:min-w-[1280px] px-4 xl:px-8 py-8 bg-white"
      >
        <h2 className="font-display text-xl xl:text-2xl font-bold uppercase tracking-tight text-center m-0 mb-1 text-zinc-900">
          2026 World Cup Knockout
        </h2>
        {bracketName && (
          <p className="text-xs text-zinc-500 text-center m-0 mb-8">{bracketName}</p>
        )}
        {!bracketName && <div className="mb-8" />}

        <div className="flex items-start justify-center gap-2 xl:gap-4">
          <BracketHalf side="left" knockout={knockout} teams={teams} groups={groups} />

          <div className="flex flex-col items-center justify-between px-2 xl:px-4 shrink-0 min-w-[160px] self-stretch py-4">
            <div className="flex flex-col items-center">
              <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-400 mb-3">Final</span>
              <div className="flex items-center gap-3">
                <FlagNode team={finalistHome} large />
                <FlagNode team={finalistAway} large />
              </div>
            </div>

            <div className="bracket-trophy flex items-center justify-center py-6 xl:py-8 min-h-[140px]">
              <img
                src={TROPHY_IMAGE}
                alt="FIFA World Cup trophy"
                crossOrigin="anonymous"
                className="bracket-trophy-img w-32 xl:w-40 h-auto max-h-48 object-contain"
              />
            </div>

            <div className="text-center">
              <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 m-0 mb-3">
                Winners
              </p>
              {champion ? (
                <>
                  <div className="flex justify-center mb-3">
                    <FlagNode team={champion} large />
                  </div>
                  <p className="font-display text-2xl xl:text-3xl font-bold uppercase tracking-tight m-0 text-zinc-900">
                    {champion.name}
                  </p>
                </>
              ) : (
                <p className="text-sm text-zinc-400 uppercase m-0">TBD</p>
              )}
            </div>
          </div>

          <BracketHalf side="right" knockout={knockout} teams={teams} groups={groups} />
        </div>
      </div>
      </div>
    </section>
  );
});

export default KnockoutBracketView;
