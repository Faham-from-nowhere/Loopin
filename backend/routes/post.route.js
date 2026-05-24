import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import { addComment, addNewPost, bookmarkPost, deletePost, dislikePost, getAllPost, getPostComments, getUserPost, likePost, deleteComment, editComment, getSmartFeed, archivePost } from "../controllers/post.controller.js";

const router = express.Router();

router.route("/addpost").post(isAuthenticated, upload.single('image'), addNewPost);
router.route("/all").get(isAuthenticated, getAllPost);
router.route("/smart").get(isAuthenticated, getSmartFeed);
router.route("/userpost/all").get(isAuthenticated, getUserPost);
router.route("/:id/like").post(isAuthenticated, likePost);
router.route("/:id/dislike").post(isAuthenticated, dislikePost);
router.route("/:id/comment").post(isAuthenticated, addComment);
router.route("/:id/comment/all").get(isAuthenticated, getPostComments);
router.route("/comment/:id").delete(isAuthenticated, deleteComment);
router.route("/comment/:id").put(isAuthenticated, editComment);
router.route("/:id/delete").delete(isAuthenticated, deletePost);
router.route("/:id/bookmark").get(isAuthenticated, bookmarkPost);
router.route("/:id/archive").put(isAuthenticated, archivePost);

export default router;

