import { Notification } from "../models/notification.model.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/errorHandler.js";

export const getNotifications = catchAsync(async (req, res, next) => {
    const userId = req.id;
    const notifications = await Notification.find({ receiver: userId })
        .populate('sender', 'username profilePicture')
        .populate('post', 'image')
        .sort({ createdAt: -1 });

    res.status(200).json({ success: true, notifications });
});

export const markAsRead = catchAsync(async (req, res, next) => {
    const notificationId = req.params.id;
    const notification = await Notification.findById(notificationId);
    if (!notification) return next(new AppError('Notification not found', 404));

    if (notification.receiver.toString() !== req.id) {
        return next(new AppError('Unauthorized', 403));
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ success: true, message: 'Notification marked as read' });
});

export const markAllAsRead = catchAsync(async (req, res, next) => {
    const userId = req.id;
    await Notification.updateMany({ receiver: userId, isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
});
