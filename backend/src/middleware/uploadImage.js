
import multer from "multer";

const storage = multer.memoryStorage();

function imageFileFilter(req, file, callback) {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
        return callback(
            new Error("Only JPG, PNG, and WEBP images are allowed.")
        );
    }

    callback(null, true);
}

const uploadImage = multer({
    storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // Maximum 5 MB
        files: 1,
    },
});

export default uploadImage;
