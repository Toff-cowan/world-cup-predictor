import { Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/AppLayout.jsx";
import MainLayout from "./layouts/MainLayout.jsx";
import LandingPage from "./pages/Landing/LandingPage.jsx";
import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";
import PredictionsPage from "./pages/Predictions/PredictionsPage.jsx";
import SharedBracketPage from "./pages/Predictions/SharedBracketPage.jsx";
import StandingsPage from "./pages/Standings/StandingsPage.jsx";
import ProfilePage from "./pages/Profile/ProfilePage.jsx";
import NewsPage from "./pages/News/NewsPage.jsx";
import NewsDetailPage from "./pages/News/NewsDetailPage.jsx";
import MatchesPage from "./pages/Matches/MatchesPage.jsx";
import ForumPage from "./pages/Forum/ForumPage.jsx";
import ForumPostPage from "./pages/Forum/ForumPostPage.jsx";
import CreatePost from "./pages/Forum/CreatePost.jsx";
import NotFound from "./pages/Errors/NotFound.jsx";
import PrivateRoute from "./routes/PrivateRoute.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="standings" element={<StandingsPage />} />
        <Route path="predictions" element={<PredictionsPage />} />
        <Route path="share/:token" element={<SharedBracketPage />} />
        <Route path="news" element={<NewsPage />} />
        <Route path="news/:slug" element={<NewsDetailPage />} />
        <Route path="fixtures" element={<MatchesPage />} />
        <Route path="forum" element={<ForumPage />} />
        <Route path="forum/new" element={<CreatePost />} />
        <Route path="forum/:id" element={<ForumPostPage />} />
        <Route
          path="profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route element={<MainLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}
