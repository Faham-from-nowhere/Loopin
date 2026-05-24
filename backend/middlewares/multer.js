import multer from "multer";

const upload = multer({ // For uploading multer
    storage:multer.memoryStorage(),
});
export default upload;