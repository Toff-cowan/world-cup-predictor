import { countSimpleGroupsComplete, isSimpleBracket } from "./bracketHelpers.js";

export function getBracketShareStatus(bracket) {
  if (!bracket?.knockout) {
    return { ready: false, message: "Build your bracket first." };
  }

  const champion = bracket.knockout.final?.m1?.winner;
  if (!champion) {
    return { ready: false, message: "Pick a champion in the Final to share your bracket." };
  }

  if (isSimpleBracket(bracket)) {
    const complete = countSimpleGroupsComplete(bracket.groups);
    if (complete < 12) {
      return {
        ready: false,
        message: `Rank all 12 groups (${complete}/12 done) before sharing.`,
      };
    }
    return { ready: true, message: "Your bracket is ready to share on the forum." };
  }

  return { ready: true, message: "Your bracket is ready to share on the forum." };
}
