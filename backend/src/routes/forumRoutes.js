import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { addComment, getPostComments } from "../controllers/forums/addComment.js";
import {
  createForumPost,
  getForumPosts,
  getSinglePost,
} from "../controllers/forums/createForumPost.js";

const router = Router();

router.get("/", getForumPosts);
router.get("/:id/comments", getPostComments);
router.post("/:id/comments", authMiddleware, addComment);
router.get("/:id", getSinglePost);
router.post("/", authMiddleware, createForumPost);

export default router;
