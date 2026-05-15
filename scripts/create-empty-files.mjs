import { mkdir, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(fileURLToPath(new URL("..", import.meta.url)));

const backendEmpty = [
  "backend/src/controllers/auth/loginController.js",
  "backend/src/controllers/auth/registerController.js",
  "backend/src/controllers/auth/logoutController.js",
  "backend/src/controllers/auth/meController.js",
  "backend/src/controllers/users/getUserProfile.js",
  "backend/src/controllers/users/updateUserProfile.js",
  "backend/src/controllers/users/getUserPredictions.js",
  "backend/src/controllers/teams/getSingleTeam.js",
  "backend/src/controllers/teams/getTeamPlayers.js",
  "backend/src/controllers/teams/getTeamMatches.js",
  "backend/src/controllers/players/getAllPlayers.js",
  "backend/src/controllers/players/getPlayerById.js",
  "backend/src/controllers/matches/getMatchById.js",
  "backend/src/controllers/matches/getLiveMatches.js",
  "backend/src/controllers/matches/simulateMatch.js",
  "backend/src/controllers/standings/calculateStandings.js",
  "backend/src/controllers/predictions/comparePrediction.js",
  "backend/src/controllers/predictions/calculateAccuracy.js",
  "backend/src/controllers/predictions/autoAdvanceBracket.js",
  "backend/src/controllers/forums/updateForumPost.js",
  "backend/src/controllers/forums/deleteForumPost.js",
  "backend/src/controllers/forums/addComment.js",
  "backend/src/controllers/forums/likePost.js",
  "backend/src/controllers/news/getFootballNews.js",
  "backend/src/controllers/news/getFeaturedNews.js",
  "backend/src/controllers/odds/getOdds.js",
  "backend/src/controllers/analytics/calculateBrierScore.js",
  "backend/src/controllers/admin/refreshTournamentData.js",
  "backend/src/services/auth/tokenService.js",
  "backend/src/services/auth/passwordService.js",
  "backend/src/services/predictions/accuracyService.js",
  "backend/src/services/predictions/lockingService.js",
  "backend/src/services/odds/oddsService.js",
  "backend/src/services/scraper/fifaScraper.js",
  "backend/src/jobs/updateMatchesJob.js",
  "backend/src/validators/authValidator.js",
  "backend/src/validators/predictionValidator.js",
  "backend/src/sockets/liveMatchesSocket.js",
  "backend/src/utils/generateBracket.js",
  "backend/src/utils/calculatePoints.js",
];

const frontendEmpty = [
  "frontend/src/pages/Landing/sections/HeroSection.jsx",
  "frontend/src/pages/Landing/sections/NewsSection.jsx",
  "frontend/src/pages/Landing/sections/StandingsPreview.jsx",
  "frontend/src/pages/Landing/sections/UpcomingMatches.jsx",
  "frontend/src/pages/Landing/sections/FeaturedPredictions.jsx",
  "frontend/src/pages/Landing/sections/ForumPreview.jsx",
  "frontend/src/pages/Landing/sections/VideosSection.jsx",
  "frontend/src/pages/Landing/sections/FAQSection.jsx",
  "frontend/src/pages/Landing/sections/CountdownSection.jsx",
  "frontend/src/pages/Auth/ForgotPassword.jsx",
  "frontend/src/pages/Auth/ResetPassword.jsx",
  "frontend/src/pages/Dashboard/Dashboard.jsx",
  "frontend/src/pages/Dashboard/UserStats.jsx",
  "frontend/src/pages/Teams/TeamsPage.jsx",
  "frontend/src/pages/Teams/TeamDetails.jsx",
  "frontend/src/pages/Players/PlayersPage.jsx",
  "frontend/src/pages/Matches/MatchesPage.jsx",
  "frontend/src/pages/Forum/ForumPage.jsx",
  "frontend/src/pages/Forum/CreatePost.jsx",
  "frontend/src/pages/News/NewsPage.jsx",
  "frontend/src/pages/Calendar/CalendarPage.jsx",
  "frontend/src/pages/Admin/AdminDashboard.jsx",
  "frontend/src/components/common/Navbar.jsx",
  "frontend/src/components/common/Footer.jsx",
  "frontend/src/hooks/useAuth.js",
  "frontend/src/hooks/useFetch.js",
  "frontend/src/hooks/usePredictions.js",
  "frontend/src/services/authService.js",
  "frontend/src/services/predictionService.js",
  "frontend/src/store/authStore.js",
  "frontend/src/store/predictionStore.js",
];

async function touch(relPath) {
  const path = join(root, relPath);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, "", { flag: "wx" }).catch(() => {});
}

for (const f of [...backendEmpty, ...frontendEmpty]) {
  await touch(f);
}

console.log(`Touched ${backendEmpty.length + frontendEmpty.length} empty files`);
