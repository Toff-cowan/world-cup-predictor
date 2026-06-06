import { forwardRef } from "react";
import KnockoutBracketShell from "./KnockoutBracketShell.jsx";
import {
  BracketCenterColumn,
  BracketFlagNode,
  BracketMatchBox,
  BracketTrophy,
  BracketWinnerBlock,
} from "./BracketMatchBox.jsx";
import { matchKey } from "../../constants/bracket.js";
import { teamById } from "../../utils/bracketHelpers.js";

function getMatch(knockout, roundKey, index) {
  return (
    knockout[roundKey]?.[matchKey(index)] || {
      home: null,
      away: null,
      winner: null,
      scores: { home: null, away: null },
    }
  );
}

function formatScore(value) {
  return value == null ? "–" : String(value);
}

function FinalScores({ match }) {
  const hs = match.scores?.home;
  const as = match.scores?.away;
  if (hs == null && as == null) return null;

  return (
    <div className="flex items-center gap-1.5 mt-2">
      <span
        className={`text-xs font-bold tabular-nums ${
          match.winner === match.home ? "text-teal-800" : "text-zinc-900"
        }`}
      >
        {formatScore(hs)}
      </span>
      <span className="text-[10px] text-zinc-400 font-bold">:</span>
      <span
        className={`text-xs font-bold tabular-nums ${
          match.winner === match.away ? "text-teal-800" : "text-zinc-900"
        }`}
      >
        {formatScore(as)}
      </span>
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
    <KnockoutBracketShell
      ref={ref}
      subtitle={bracketName}
      renderMatch={(roundKey, idx, mirrored) => (
        <BracketMatchBox
          match={getMatch(knockout, roundKey, idx)}
          teams={teams}
          groups={groups}
          mirrored={mirrored}
          showScores
          locked
        />
      )}
      centerColumn={
        <BracketCenterColumn>
          <div className="flex flex-col items-center">
            <span className="bracket-round-label mb-2">Final</span>
            <div className="flex items-center gap-2">
              <BracketFlagNode
                team={finalistHome}
                large
                winner={finalMatch.winner === finalMatch.home}
              />
              <BracketFlagNode
                team={finalistAway}
                large
                winner={finalMatch.winner === finalMatch.away}
              />
            </div>
            <FinalScores match={finalMatch} />
          </div>

          <BracketTrophy />

          <BracketWinnerBlock champion={champion} />
        </BracketCenterColumn>
      }
    />
  );
});

export default KnockoutBracketView;
