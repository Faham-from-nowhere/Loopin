import express, {urlencoded} from "express";
import path from "path";
import { fileURLToPath } from 'url';
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js";
import storyRoute from "./routes/story.route.js";
import notificationRoute from "./routes/notification.route.js";
import { app, server } from "./socket/socket.js";
import { errorHandler } from "./utils/errorHandler.js";

dotenv.config({});

const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/", (_, res) => {
    return res.status(200).json({
        message:"The backend says Hi!",
        success:true
    })
})
//Middleware
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({extended:true}));
const corsOptions = {
    origin: process.env.URL || 'http://localhost:5173',
    credentials:true
}
app.use(cors(corsOptions));

app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);
app.use("/api/v1/story", storyRoute);
app.use("/api/v1/notification", notificationRoute);

app.use(errorHandler);

server.listen(PORT,()=>{
    connectDB();
    console.log(`Server is running at ${PORT}`);
})