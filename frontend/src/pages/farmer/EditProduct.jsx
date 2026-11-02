
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import ProductImageUpload from "../../components/ProductImageUpload";
import "./EditProduct.css";

const categories = [
    ["grains", "Grains and Cereals"],
    ["pulses", "Pulses and Lentils"],
    ["vegetables", "Vegetables"],
    ["fruits", "Fruits"],
    ["dairy", "Dairy Products"],
    ["spices", "Spices"],
    ["seeds", "Seeds"],
    ["nuts_dry_fruits", "Nuts and Dry Fruits"],
    ["honey", "Honey"],
    ["oil_products", "Oil Products"],
    ["organic_products", "Organic Products"],
    ["fertilizers", "Fertilizers"],
    ["manure", "Manure and Compost"],
    ["farming_tools", "Farming Tools"],
    ["irrigation", "Irrigation Equipment"],
    ["animal_feed", "Animal Feed"],
    ["other", "Other"],
];

const units = [
    "kg", "gram", "litre", "ml", "piece", "bunch", "bag", "pack", "dozen",
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
    isActive: true,
};

function extractProducts(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.products)) return data.products;
    if (Array.isArray(data?.data)) return data.data;
    return [];
}

export default function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadProduct() {
            setLoading(true);
            setError("");

            try {
                // This endpoint returns products belonging to the logged-in farmer.
                const response = await api.get("/products/my-products");
                const products = extractProducts(response.data);
                const product = products.find((item) => item._id === id);

                if (!product) {
                    throw new Error(
                        "Product not found in your listings. It may have been deleted."
                    );
                }

                if (cancelled) return;

                setForm({
                    ...initialForm,
                    ...product,
                    price: String(product.price ?? ""),
                    quantity: String(product.quantity ?? ""),
                    tags: Array.isArray(product.tags)
                        ? product.tags.join(", ")
                        : "",
                    imageUrl: product.imageUrl || "",
                    isOrganic: Boolean(product.isOrganic),
                    isActive: product.isActive !== false,
                });
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.response?.data?.message ||
                        err.message ||
                        "Unable to load this product."
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadProduct();

        return () => {
            cancelled = true;
        };
    }, [id]);

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

        const price = Number(form.price);
        const quantity = Number(form.quantity);

        if (!form.name.trim() || !form.category || !form.location.trim()) {
            setError("Please complete the product name, category, and location.");
            return;
        }

        if (!Number.isFinite(price) || price <= 0) {
            setError("Price must be greater than zero.");
            return;
        }

        if (!Number.isFinite(quantity) || quantity < 0) {
            setError("Quantity must be zero or greater.");
            return;
        }

        if (!form.imageUrl) {
            setError("Please upload a product image.");
            return;
        }

        const payload = {
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
            tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
            isActive: form.isActive,
        };

        setSaving(true);

        try {
            await api.patch(`/products/${id}`, payload);

            navigate("/farmer/products", {
                replace: true,
                state: { message: "Product updated successfully." },
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update this product. Please check your details."
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <main className="edit-product-page">
                <p>Loading your product details...</p>
            </main>
        );
    }

    if (error && !form.name) {
        return (
            <main className="edit-product-page">
                <h1>Unable to open product</h1>
                <p className="edit-product-error" role="alert">{error}</p>
                <Link to="/farmer/products">← Back to My Products</Link>
            </main>
        );
    }

    return (
        <main className="edit-product-page">
            <header className="edit-product-header">
                <Link to="/farmer/products">← Back to My Products</Link>
                <p className="edit-product-eyebrow">FARMER WORKSPACE</p>
                <h1>Edit product</h1>
                <p>Update your listing so customers see the correct information.</p>
            </header>

            <form className="edit-product-form" onSubmit={handleSubmit}>
                <section className="edit-product-card">
                    <h2>Product information</h2>

                    <div className="edit-product-grid">
                        <label>
                            Product name *
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                maxLength={120}
                                required
                            />
                        </label>

                        <label>
                            Category *
                            <select
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Choose a category</option>
                                {categories.map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Subcategory
                            <input
                                name="subcategory"
                                value={form.subcategory}
                                onChange={handleChange}
                            />
                        </label>

                        <label>
                            Variety
                            <input
                                name="variety"
                                value={form.variety}
                                onChange={handleChange}
                            />
                        </label>

                        <label>
                            Brand or farm name
                            <input
                                name="brand"
                                value={form.brand}
                                onChange={handleChange}
                            />
                        </label>

                        <label>
                            Price (₹) *
                            <input
                                name="price"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={form.price}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label>
                            Unit
                            <select name="unit" value={form.unit} onChange={handleChange}>
                                {units.map((unit) => (
                                    <option key={unit} value={unit}>{unit}</option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Available quantity *
                            <input
                                name="quantity"
                                type="number"
                                min="0"
                                step="any"
                                value={form.quantity}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label>
                            Condition
                            <select
                                name="condition"
                                value={form.condition}
                                onChange={handleChange}
                            >
                                {["fresh", "dried", "processed", "packaged", "other"].map(
                                    (value) => (
                                        <option key={value} value={value}>
                                            {value.charAt(0).toUpperCase() + value.slice(1)}
                                        </option>
                                    )
                                )}
                            </select>
                        </label>

                        <label className="edit-product-full">
                            Description
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows={4}
                                maxLength={2000}
                            />
                        </label>

                        <label className="edit-product-full">
                            Farm or pickup location *
                            <input
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label className="edit-product-full">
                            Search keywords (comma-separated)
                            <input
                                name="tags"
                                value={form.tags}
                                onChange={handleChange}
                                placeholder="millet, farm fresh, natural"
                            />
                        </label>
                    </div>

                    <label className="edit-product-checkbox">
                        <input
                            type="checkbox"
                            name="isOrganic"
                            checked={form.isOrganic}
                            onChange={handleChange}
                        />
                        This product is organic
                    </label>

                    <label className="edit-product-checkbox">
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={form.isActive}
                            onChange={handleChange}
                        />
                        Product is active and visible to customers
                    </label>
                </section>

                <section className="edit-product-card">
                    <h2>Product photo</h2>
                    <p>Keep the existing photo or upload a replacement.</p>

                    <ProductImageUpload
                        imageUrl={form.imageUrl}
                        onImageUploaded={(url) =>
                            setForm((current) => ({ ...current, imageUrl: url }))
                        }
                    />
                </section>

                {error && (
                    <p className="edit-product-error" role="alert">{error}</p>
                )}

                <div className="edit-product-actions">
                    <Link to="/farmer/products" className="edit-product-cancel">
                        Cancel
                    </Link>

                    <button type="submit" disabled={saving}>
                        {saving ? "Saving changes..." : "Save changes"}
                    </button>
                </div>
            </form>
        </main>
    );
}
