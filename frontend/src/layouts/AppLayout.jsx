import { Outlet } from "react-router-dom";
import SiteHeader from "../components/common/SiteHeader.jsx";
import CountdownKickoffButton from "../components/common/CountdownKickoffButton.jsx";
import CountdownRibbon from "../components/common/CountdownRibbon.jsx";
import { useCountdownVisibility } from "../context/CountdownVisibilityContext.jsx";

export default function AppLayout() {
  const { visible, hide } = useCountdownVisibility();

  return (
    <>
      <div className="sticky top-0 z-50">
        <SiteHeader />
        <div className="flex justify-center bg-black border-b border-white/10 pb-0">
          <CountdownKickoffButton />
        </div>
        {visible && <CountdownRibbon onClose={hide} />}
      </div>
      <Outlet />
    </>
  );
}
