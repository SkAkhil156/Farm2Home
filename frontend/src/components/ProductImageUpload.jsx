
import { useEffect, useState } from "react";
import api from "../api/axios";

export default function ProductImageUpload({
    imageUrl = "",
    onImageUploaded,
}) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(imageUrl || "");
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (!file) {
            setPreview(imageUrl || "");
        }
    }, [imageUrl, file]);

    useEffect(() => {
        if (!file) return;

        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    function handleFileChange(event) {
        const selectedFile = event.target.files?.[0];

        setError("");
        setSuccess("");

        if (!selectedFile) return;

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

        if (!allowedTypes.includes(selectedFile.type)) {
            setFile(null);
            setPreview(imageUrl || "");
            setError("Please select a JPG, PNG, or WEBP image.");
            event.target.value = "";
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            setFile(null);
            setPreview(imageUrl || "");
            setError("The image must be 5 MB or smaller.");
            event.target.value = "";
            return;
        }

        // A newly selected image must be uploaded before publishing.
        setFile(selectedFile);
        onImageUploaded("");
    }

    async function handleUpload() {
        if (!file) {
            setError("Please choose an image first.");
            return;
        }

        try {
            setUploading(true);
            setError("");
            setSuccess("");

            const formData = new FormData();
            formData.append("image", file);

            const response = await api.post(
                "/products/upload-image",
                formData
            );

            const uploadedImageUrl = response.data?.imageUrl;

            if (!uploadedImageUrl) {
                throw new Error("The server did not return an image URL.");
            }

            onImageUploaded(uploadedImageUrl);
            setFile(null);
            setPreview(uploadedImageUrl);
            setSuccess("Image uploaded successfully!");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Image upload failed. Please try again."
            );
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="product-image-upload">
            <label htmlFor="product-image">Product image *</label>

            <p>
                Choose a clear photo of your product. JPG, PNG, or WEBP,
                maximum 5 MB.
            </p>

            <input
                id="product-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                disabled={uploading}
            />

            {preview && (
                <div style={{ marginTop: 12 }}>
                    <img
                        src={preview}
                        alt="Product preview"
                        style={{
                            width: "220px",
                            height: "180px",
                            objectFit: "contain",
                            borderRadius: "10px",
                            border: "1px solid #ddd",
                            background: "#fff",
                        }}
                    />
                </div>
            )}

            {file && (
                <p>
                    Selected: {file.name}
                    <br />
                    Click Upload image to save it before publishing the product.
                </p>
            )}

            <button
                type="button"
                onClick={handleUpload}
                disabled={!file || uploading}
                style={{ marginTop: 12 }}
            >
                {uploading ? "Uploading..." : "Upload image"}
            </button>

            {error && (
                <p role="alert" style={{ color: "crimson" }}>
                    {error}
                </p>
            )}

            {success && (
                <p role="status" style={{ color: "green" }}>
                    {success}
                </p>
            )}

            {imageUrl && !file && !uploading && (
                <p style={{ color: "green" }}>
                    ✓ Product image is ready to publish.
                </p>
            )}
        </div>
    );
}
