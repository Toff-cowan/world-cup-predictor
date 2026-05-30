import { useEffect, useMemo, useState } from "react";
import { getFlagUrls } from "../../utils/flagUrl.js";

export default function TeamFlag({ countryCode, teamCode, className = "w-9 h-6" }) {
  const urls = useMemo(() => getFlagUrls(countryCode, teamCode), [countryCode, teamCode]);
  const [urlIndex, setUrlIndex] = useState(0);

  useEffect(() => {
    setUrlIndex(0);
  }, [urls]);

  const src = urls[urlIndex];

  if (!src) {
    return <span className={`${className} bg-zinc-200 dark:bg-zinc-700 rounded-sm shrink-0 block`} />;
  }

  function handleError() {
    setUrlIndex((i) => (i + 1 < urls.length ? i + 1 : urls.length));
  }

  if (urlIndex >= urls.length) {
    return <span className={`${className} bg-zinc-200 dark:bg-zinc-700 rounded-sm shrink-0 block`} />;
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
