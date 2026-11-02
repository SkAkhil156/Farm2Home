
import cloudinary from "../config/cloudinary.js";

export async function uploadProductImage(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select a product image.",
            });
        }

        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "farm2home/products",
                    resource_type: "image",
                    transformation: [
                        { width: 1200, height: 1200, crop: "limit" },
                    ],
                },
                (error, uploadedImage) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(uploadedImage);
                    }
                }
            );

            stream.end(req.file.buffer);
        });

        return res.status(201).json({
            success: true,
            message: "Product image uploaded successfully.",
            imageUrl: result.secure_url,
            publicId: result.public_id,
        });
    } catch (error) {
        console.error("Cloudinary image upload failed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Image upload failed. Please try again.",
        });
    }
}
