import express from "express";
import { register, login, logout, editProfile, followOrUnfollow, getProfile, getSuggestedUsers, searchUsers, togglePrivacy, acceptFollowRequest, rejectFollowRequest, getFollowingUsers } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/:id/profile').get(isAuthenticated, getProfile);
router.route('/profile/edit').post(isAuthenticated, upload.single('profilePhoto'), editProfile);
router.route('/suggested').get(isAuthenticated, getSuggestedUsers);
router.route('/following').get(isAuthenticated, getFollowingUsers);
router.route('/search').get(isAuthenticated, searchUsers);
router.route('/followorunfollow/:id').post(isAuthenticated, followOrUnfollow);
router.route('/toggle-privacy').post(isAuthenticated, togglePrivacy);
router.route('/follow-request/:id/accept').post(isAuthenticated, acceptFollowRequest);
router.route('/follow-request/:id/reject').post(isAuthenticated, rejectFollowRequest);

export default router;