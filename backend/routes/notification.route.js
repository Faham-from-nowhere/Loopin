import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getNotifications, markAsRead, markAllAsRead } from "../controllers/notification.controller.js";

const router = express.Router();

router.route("/").get(isAuthenticated, getNotifications);
router.route("/mark-all-read").post(isAuthenticated, markAllAsRead);
router.route("/:id/read").post(isAuthenticated, markAsRead);

export default router;
