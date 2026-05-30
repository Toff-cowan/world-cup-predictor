import { Outlet } from "react-router-dom";
import SiteHeader from "../components/common/SiteHeader.jsx";
import SiteFooter from "../components/common/SiteFooter.jsx";
import CountdownKickoffBar from "../components/common/CountdownKickoffBar.jsx";
import FloatingNewsHighlights from "../components/common/FloatingNewsHighlights.jsx";
import FifaDisclaimerModal from "../components/common/FifaDisclaimerModal.jsx";

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <FifaDisclaimerModal />
      <div className="sticky top-0 z-50">
        <SiteHeader />
        <CountdownKickoffBar />
      </div>
      <div className="flex-1 app-main-mobile-pad">
        <Outlet />
      </div>
      <SiteFooter />
      <FloatingNewsHighlights />
    </div>
  );
}
