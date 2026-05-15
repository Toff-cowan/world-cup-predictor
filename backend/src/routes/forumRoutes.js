import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createForumPost,
  getForumPosts,
  getSinglePost,
} from "../controllers/forums/createForumPost.js";

const router = Router();

router.get("/", getForumPosts);
router.get("/:id", getSinglePost);
router.post("/", authMiddleware, createForumPost);

export default router;
