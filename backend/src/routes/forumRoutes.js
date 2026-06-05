import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { optionalAuthMiddleware } from "../middleware/optionalAuthMiddleware.js";
import { addComment, getPostComments } from "../controllers/forums/addComment.js";
import { votePost } from "../controllers/forums/likePost.js";
import {
  createForumPost,
  getForumPosts,
  getSinglePost,
} from "../controllers/forums/createForumPost.js";

const router = Router();

router.get("/", optionalAuthMiddleware, getForumPosts);
router.get("/:id/comments", getPostComments);
router.post("/:id/comments", authMiddleware, addComment);
router.post("/:id/vote", authMiddleware, votePost);
router.get("/:id", optionalAuthMiddleware, getSinglePost);
router.post("/", authMiddleware, createForumPost);

export default router;
