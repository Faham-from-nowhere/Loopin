import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import { addStory, getStories, viewStory } from "../controllers/story.controller.js";

const router = express.Router();

router.route("/").post(isAuthenticated, upload.single('image'), addStory);
router.route("/").get(isAuthenticated, getStories);
router.route("/:id/view").post(isAuthenticated, viewStory);

export default router;
