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
    }
  );
}

function FinalPick({ match, teams, locked, onWinner }) {
  const homeTeam = teamById(teams, match.home);
  const awayTeam = teamById(teams, match.away);
  const canPick = !locked && match.home && match.away;

  return (
    <div className="flex items-center gap-2">
      <BracketFlagNode
        team={homeTeam}
        large
        winner={match.winner === match.home}
        locked={!canPick}
        onClick={canPick ? () => onWinner("final", 1, match.home) : undefined}
      />
      {match.home && match.away && (
        <span className="text-[9px] font-bold uppercase text-zinc-400">vs</span>
      )}
      <BracketFlagNode
        team={awayTeam}
        large
        winner={match.winner === match.away}
        locked={!canPick}
        onClick={canPick ? () => onWinner("final", 1, match.away) : undefined}
      />
    </div>
  );
}

const SimpleKnockoutBracket = forwardRef(function SimpleKnockoutBracket(
  { knockout, teams, groups, bracketName, isStageLocked, onWinner },
  ref
) {
  const finalMatch = getMatch(knockout, "final", 1);
  const champion = teamById(teams, finalMatch.winner);

  return (
    <KnockoutBracketShell
      ref={ref}
      subtitle={bracketName}
      renderMatch={(roundKey, idx, mirrored) => {
        const match = getMatch(knockout, roundKey, idx);
        const locked = isStageLocked(roundKey);
        const canPick = !locked && match.home && match.away;

        return (
          <BracketMatchBox
            match={match}
            teams={teams}
            groups={groups}
            mirrored={mirrored}
            locked={locked}
            onPickHome={canPick ? () => onWinner(roundKey, idx, match.home) : undefined}
            onPickAway={canPick ? () => onWinner(roundKey, idx, match.away) : undefined}
          />
        );
      }}
      centerColumn={
        <BracketCenterColumn>
          <div className="flex flex-col items-center w-full">
            <span className="bracket-round-label mb-2">Final</span>
            <FinalPick
              match={finalMatch}
              teams={teams}
              locked={isStageLocked("final")}
              onWinner={onWinner}
            />
          </div>

          <BracketTrophy />

          <BracketWinnerBlock champion={champion} />
        </BracketCenterColumn>
      }
    />
  );
});

export default SimpleKnockoutBracket;
