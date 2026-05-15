import { Outlet } from "react-router-dom";
import SiteHeader from "../components/common/SiteHeader.jsx";
import CountdownRibbon from "../components/common/CountdownRibbon.jsx";
import { useCountdownVisible } from "../hooks/useCountdownVisible.js";

export default function AppLayout() {
  const { visible, hide, show } = useCountdownVisible();

  return (
    <>
      <SiteHeader countdownHidden={!visible} onShowCountdown={show} />
      {visible && <CountdownRibbon onClose={hide} />}
      <Outlet />
    </>
  );
}
