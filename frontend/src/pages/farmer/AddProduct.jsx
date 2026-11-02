
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import ProductImageUpload from "../../components/ProductImageUpload";
import "./AddProduct.css";

const categories = [
    { value: "grains", label: "Grains and Cereals" },
    { value: "pulses", label: "Pulses and Lentils" },
    { value: "vegetables", label: "Vegetables" },
    { value: "fruits", label: "Fruits" },
    { value: "dairy", label: "Dairy Products" },
    { value: "spices", label: "Spices" },
    { value: "seeds", label: "Seeds" },
    { value: "nuts_dry_fruits", label: "Nuts and Dry Fruits" },
    { value: "honey", label: "Honey" },
    { value: "oil_products", label: "Oil Products" },
    { value: "organic_products", label: "Organic Products" },
    { value: "fertilizers", label: "Fertilizers" },
    { value: "manure", label: "Manure and Compost" },
    { value: "farming_tools", label: "Farming Tools" },
    { value: "irrigation", label: "Irrigation Equipment" },
    { value: "animal_feed", label: "Animal Feed" },
    { value: "other", label: "Other" },
];

const units = [
    { value: "kg", label: "Kilogram (kg)" },
    { value: "gram", label: "Gram (g)" },
    { value: "litre", label: "Litre (L)" },
    { value: "ml", label: "Millilitre (ml)" },
    { value: "piece", label: "Piece" },
    { value: "bunch", label: "Bunch" },
    { value: "bag", label: "Bag" },
    { value: "pack", label: "Pack" },
    { value: "dozen", label: "Dozen" },
];

const initialForm = {
    name: "",
    category: "",
    subcategory: "",
    description: "",
    variety: "",
    brand: "",
    price: "",
    unit: "kg",
    quantity: "",
    imageUrl: "",
    isOrganic: false,
    condition: "fresh",
    location: "",
    tags: "",
};

export default function AddProduct() {
    const navigate = useNavigate();

    const [form, setForm] = useState(initialForm);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    function handleChange(event) {
        const { name, value, type, checked } = event.target;

        setForm((current) => ({
            ...current,
            [name]: type === "checkbox" ? checked : value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (!form.name.trim()) {
            setError("Please enter a product name.");
            return;
        }

        if (!form.category) {
            setError("Please select a product category.");
            return;
        }

        if (!form.imageUrl) {
            setError("Please upload a product image before submitting.");
            return;
        }

        if (!form.location.trim()) {
            setError("Please enter your farm or pickup location.");
            return;
        }

        const price = Number(form.price);
        const quantity = Number(form.quantity);

        if (!Number.isFinite(price) || price <= 0) {
            setError("Price must be greater than zero.");
            return;
        }

        if (!Number.isFinite(quantity) || quantity < 0) {
            setError("Quantity must be zero or greater.");
            return;
        }

        const productData = {
            name: form.name.trim(),
            category: form.category,
            subcategory: form.subcategory.trim(),
            description: form.description.trim(),
            variety: form.variety.trim(),
            brand: form.brand.trim(),
            price,
            unit: form.unit,
            quantity,
            imageUrl: form.imageUrl,
            isOrganic: form.isOrganic,
            condition: form.condition,
            location: form.location.trim(),
            tags: form.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
        };

        setSubmitting(true);

        try {
            await api.post("/products", productData);

            setSuccess("Your product has been added successfully.");

            navigate("/farmer/products", {
                replace: true,
                state: { message: "Product added successfully." },
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "We couldn't add your product. Please check your details and try again."
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="add-product-page">
            <header className="add-product-header">
                <div>
                    <Link to="/farmer/dashboard" className="add-product-back">
                        ← Back to dashboard
                    </Link>
                    <p className="add-product-eyebrow">FARMER WORKSPACE</p>
                    <h1>Add a new product</h1>
                    <p className="add-product-subtitle">
                        Share your farm produce with customers on Farm2Home.
                    </p>
                </div>
            </header>

            <form className="add-product-form" onSubmit={handleSubmit}>
                <section className="add-product-card">
                    <div className="add-product-section-title">
                        <span>01</span>
                        <div>
                            <h2>Basic information</h2>
                            <p>Tell customers what you are selling.</p>
                        </div>
                    </div>

                    <div className="add-product-grid">
                        <div className="add-product-field">
                            <label htmlFor="name">Product name *</label>
                            <input
                                id="name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="e.g. Organic finger millet"
                                maxLength={120}
                                required
                            />
                        </div>

                        <div className="add-product-field">
                            <label htmlFor="category">Category *</label>
                            <select
                                id="category"
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select a category</option>
                                {categories.map((category) => (
                                    <option key={category.value} value={category.value}>
                                        {category.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="add-product-field">
                            <label htmlFor="subcategory">Subcategory</label>
                            <input
                                id="subcategory"
                                name="subcategory"
                                value={form.subcategory}
                                onChange={handleChange}
                                placeholder="e.g. Finger millet"
                                maxLength={100}
                            />
                        </div>

                        <div className="add-product-field">
                            <label htmlFor="variety">Variety</label>
                            <input
                                id="variety"
                                name="variety"
                                value={form.variety}
                                onChange={handleChange}
                                placeholder="e.g. Traditional red variety"
                                maxLength={100}
                            />
                        </div>

                        <div className="add-product-field">
                            <label htmlFor="brand">Brand or farm name</label>
                            <input
                                id="brand"
                                name="brand"
                                value={form.brand}
                                onChange={handleChange}
                                placeholder="Optional"
                                maxLength={100}
                            />
                        </div>

                        <div className="add-product-field add-product-full">
                            <label htmlFor="description">Product description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Describe freshness, quality, harvest date, packaging, or other useful details."
                                rows={4}
                                maxLength={2000}
                            />
                            <small>{form.description.length}/2000 characters</small>
                        </div>
                    </div>
                </section>

                <section className="add-product-card">
                    <div className="add-product-section-title">
                        <span>02</span>
                        <div>
                            <h2>Price and stock</h2>
                            <p>Set a clear price and the quantity you have available.</p>
                        </div>
                    </div>

                    <div className="add-product-grid">
                        <div className="add-product-field">
                            <label htmlFor="price">Price in rupees (₹) *</label>
                            <input
                                id="price"
                                name="price"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={form.price}
                                onChange={handleChange}
                                placeholder="e.g. 80"
                                required
                            />
                            <small>Enter the price for one selected unit.</small>
                        </div>

                        <div className="add-product-field">
                            <label htmlFor="unit">Selling unit *</label>
                            <select
                                id="unit"
                                name="unit"
                                value={form.unit}
                                onChange={handleChange}
                                required
                            >
                                {units.map((unit) => (
                                    <option key={unit.value} value={unit.value}>
                                        {unit.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="add-product-field">
                            <label htmlFor="quantity">Available quantity *</label>
                            <input
                                id="quantity"
                                name="quantity"
                                type="number"
                                min="0"
                                step="any"
                                value={form.quantity}
                                onChange={handleChange}
                                placeholder="e.g. 100"
                                required
                            />
                            <small>Enter the amount available in the selected unit.</small>
                        </div>

                        <div className="add-product-field">
                            <label htmlFor="condition">Product condition</label>
                            <select
                                id="condition"
                                name="condition"
                                value={form.condition}
                                onChange={handleChange}
                            >
                                <option value="fresh">Fresh</option>
                                <option value="dried">Dried</option>
                                <option value="processed">Processed</option>
                                <option value="packaged">Packaged</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <label className="add-product-organic add-product-full">
                            <input
                                type="checkbox"
                                name="isOrganic"
                                checked={form.isOrganic}
                                onChange={handleChange}
                            />
                            <span>
                                <strong>Organic product</strong>
                                <small>
                                    Select this only if your product qualifies for this claim.
                                </small>
                            </span>
                        </label>
                    </div>
                </section>

                <section className="add-product-card">
                    <div className="add-product-section-title">
                        <span>03</span>
                        <div>
                            <h2>Product image</h2>
                            <p>Upload a clear photo so customers can identify your produce.</p>
                        </div>
                    </div>

                    <ProductImageUpload
                        imageUrl={form.imageUrl}
                        onImageUploaded={(url) =>
                            setForm((current) => ({ ...current, imageUrl: url }))
                        }
                    />
                </section>

                <section className="add-product-card">
                    <div className="add-product-section-title">
                        <span>04</span>
                        <div>
                            <h2>Farm and delivery location</h2>
                            <p>Tell customers where the produce is available.</p>
                        </div>
                    </div>

                    <div className="add-product-grid">
                        <div className="add-product-field add-product-full">
                            <label htmlFor="location">Farm or pickup location *</label>
                            <input
                                id="location"
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                                placeholder="Village, mandal, district, state"
                                maxLength={250}
                                required
                            />
                        </div>

                        <div className="add-product-field add-product-full">
                            <label htmlFor="tags">Search keywords</label>
                            <input
                                id="tags"
                                name="tags"
                                value={form.tags}
                                onChange={handleChange}
                                placeholder="e.g. millet, natural, farm fresh"
                            />
                            <small>Separate keywords with commas.</small>
                        </div>
                    </div>
                </section>

                {error && (
                    <div className="add-product-error" role="alert">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="add-product-success" role="status">
                        {success}
                    </div>
                )}

                <div className="add-product-actions">
                    <Link to="/farmer/products" className="add-product-cancel">
                        Cancel
                    </Link>

                    <button
                        type="submit"
                        className="add-product-submit"
                        disabled={submitting}
                    >
                        {submitting ? "Adding product..." : "Publish product →"}
                    </button>
                </div>

                <p className="add-product-required-note">
                    Fields marked with * are required.
                </p>
            </form>
        </main>
    );
}
