import { Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/AppLayout.jsx";
import MainLayout from "./layouts/MainLayout.jsx";
import LandingPage from "./pages/Landing/LandingPage.jsx";
import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";
import PredictionsPage from "./pages/Predictions/PredictionsPage.jsx";
import StandingsPage from "./pages/Standings/StandingsPage.jsx";
import ProfilePage from "./pages/Profile/ProfilePage.jsx";
import NotFound from "./pages/Errors/NotFound.jsx";
import PrivateRoute from "./routes/PrivateRoute.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="standings" element={<StandingsPage />} />
        <Route
          path="predictions"
          element={
            <PrivateRoute>
              <PredictionsPage />
            </PrivateRoute>
          }
        />
        <Route element={<MainLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route
            path="profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}
