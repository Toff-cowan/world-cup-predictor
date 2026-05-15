import { useState } from "react";
import { getFlagUrl } from "../../utils/flagUrl.js";

export default function TeamFlag({ countryCode, teamCode, className = "w-9 h-6" }) {
  const src = getFlagUrl(null, countryCode, teamCode);
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <span className={`${className} bg-zinc-200 rounded-sm shrink-0 block`} />;
  }

  return (
    <img
      src={src}
      alt=""
      className={`${className} object-cover rounded-sm shrink-0`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
