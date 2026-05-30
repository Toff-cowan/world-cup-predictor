import { useState } from "react";
import { getFlagApiUrl, getFlagCdnUrl } from "../../utils/flagUrl.js";

export default function TeamFlag({ countryCode, teamCode, className = "w-9 h-6" }) {
  const cdnUrl = getFlagCdnUrl(countryCode, teamCode);
  const apiUrl = getFlagApiUrl(countryCode, teamCode);
  const [src, setSrc] = useState(cdnUrl || apiUrl);
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <span className={`${className} bg-zinc-200 dark:bg-zinc-700 rounded-sm shrink-0 block`} />;
  }

  function handleError() {
    if (src === cdnUrl && apiUrl) {
      setSrc(apiUrl);
      return;
    }
    setFailed(true);
  }

  return (
    <img
      src={src}
      alt=""
      className={`${className} object-cover rounded-sm shrink-0`}
      loading="lazy"
      decoding="async"
      onError={handleError}
    />
  );
}
