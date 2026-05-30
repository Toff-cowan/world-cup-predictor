import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { corsOptions } from "./config/cors.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";

import authRoutes from "./routes/authRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import standingsRoutes from "./routes/standingsRoutes.js";
import predictionRoutes from "./routes/predictionRoutes.js";
import forumRoutes from "./routes/forumRoutes.js";
import scraperRoutes from "./routes/scraperRoutes.js";
import flagRoutes from "./routes/flagRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "world-cup-predictor-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/standings", standingsRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/scraper", scraperRoutes);
app.use("/api/flags", flagRoutes);
app.use("/api/news", newsRoutes);

app.use(errorMiddleware);

export default app;
