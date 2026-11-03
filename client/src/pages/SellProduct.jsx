import { useState } from "react";
import { apiUrl } from "../utils/api.js";

function SellProduct({ onBack }) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        category: "",
        condition: "",
        image: "",
        stock: "0",
        author: "",
        genreBadge: "",
        semesterTag: "",
        originalPrice: "",
        rentPrice: "",
        pickup: "",
        allowSwap: false
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (
            !formData.title ||
            !formData.description ||
            !formData.price ||
            !formData.category ||
            !formData.condition
        ) {
            setError("Please fill in all fields.");
            return;
        }

        if (Number(formData.price) < 0) {
            setError("Price cannot be negative.");
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setError("Please login again.");
                return;
            }

            const response = await fetch(
                apiUrl("products"),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        title: formData.title,
                        description: formData.description,
                        price: Number(formData.price),
                        category: formData.category,
                        condition: formData.condition,
                        image: formData.image,
                        stock: Number(formData.stock),
                        author: formData.author,
                        genreBadge: formData.genreBadge,
                        semesterTag: formData.semesterTag,
                        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : 0,
                        rentPrice: formData.rentPrice ? Number(formData.rentPrice) : 0,
                        pickup: formData.pickup,
                        allowSwap: formData.allowSwap
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Unable to add product.");
                return;
            }

            setMessage("Product listed successfully!");

            setFormData({
                title: "",
                description: "",
                price: "",
                category: "",
                condition: "",
                image: "",
                stock: "0",
                author: "",
                genreBadge: "",
                semesterTag: "",
                originalPrice: "",
                rentPrice: "",
                pickup: "",
                allowSwap: false
            });

        } catch (error) {
            console.error("Add Product Error:", error);
            setError("Unable to connect to server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="sell-page">

            <div className="sell-container">

                <div className="sell-top">

                    <button
                        className="back-button"
                        onClick={onBack}
                    >
                        ← Back to Dashboard
                    </button>

                </div>

                <div className="sell-header">

                    <div className="sell-header-icon">
                        +
                    </div>

                    <div>
                        <h1>Sell an Item</h1>

                        <p>
                            List your item and connect with other students.
                        </p>
                    </div>

                </div>

                <div className="sell-card">

                    <form onSubmit={handleSubmit}>

                        <div className="form-section">

                            <h2>Product Information</h2>

                            <p>
                                Tell students about the item you're selling.
                            </p>

                        </div>

                        <div className="sell-form-grid">

                            <div className="sell-input-group full">

                                <label>
                                    Product Name
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Engineering Mathematics Book"
                                    required
                                />

                            </div>

                            <div className="sell-input-group full">

                                <label>
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe your product..."
                                    rows="5"
                                    required
                                />

                            </div>

                            <div className="sell-input-group">

                                <label>
                                    Price (₹)
                                </label>

                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="Enter price"
                                    min="0"
                                    required
                                />

                            </div>

                            <div className="sell-input-group">
                                <label>Author / subtitle</label>
                                <input type="text" name="author" maxLength="120" value={formData.author} onChange={handleChange} placeholder="Author or item subtitle" />
                            </div>

                            <div className="sell-input-group">
                                <label>Original price (₹)</label>
                                <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} min="0" step="0.01" placeholder="Optional" />
                            </div>

                            <div className="sell-input-group">
                                <label>Weekly rent (₹)</label>
                                <input type="number" name="rentPrice" value={formData.rentPrice} onChange={handleChange} min="0" step="0.01" placeholder="Leave empty if not rentable" />
                            </div>

                            <div className="sell-input-group">
                                <label>Genre / item tag</label>
                                <input type="text" name="genreBadge" maxLength="80" value={formData.genreBadge} onChange={handleChange} placeholder="e.g. Mystery, Exam gear" />
                            </div>

                            <div className="sell-input-group">
                                <label>Semester / audience</label>
                                <input type="text" name="semesterTag" maxLength="80" value={formData.semesterTag} onChange={handleChange} placeholder="e.g. Semester 5" />
                            </div>

                            <div className="sell-input-group full">
                                <label>Campus pickup point</label>
                                <input type="text" name="pickup" maxLength="160" value={formData.pickup} onChange={handleChange} placeholder="e.g. Central Library steps" />
                            </div>

                            <label className="sell-swap-option"><input type="checkbox" name="allowSwap" checked={formData.allowSwap} onChange={(e) => setFormData({ ...formData, allowSwap: e.target.checked })} /> Open to swaps</label>

                            <div className="sell-input-group">
                                <label>Available stock</label>
                                <input type="number" name="stock" value={formData.stock} onChange={handleChange} min="0" step="1" required />
                            </div>

                            <div className="sell-input-group full">
                                <label>Image URL (optional)</label>
                                <input type="url" name="image" value={formData.image} onChange={handleChange} placeholder="https://example.com/product.jpg" />
                            </div>

                            <div className="sell-input-group">

                                <label>
                                    Category
                                </label>

                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">
                                        Select category
                                    </option>

                                    <option value="Books">
                                        Books
                                    </option>

                                    <option value="Story & Novels">Story &amp; Novels</option>
                                    <option value="Books & Non-Fiction">Books &amp; Non-Fiction</option>
                                    <option value="Textbooks">Textbooks</option>
                                    <option value="Lab & Hostel">Lab &amp; Hostel</option>

                                    <option value="Electronics">
                                        Electronics
                                    </option>

                                    <option value="Furniture">
                                        Furniture
                                    </option>

                                    <option value="Clothing">
                                        Clothing
                                    </option>

                                    <option value="Notes">
                                        Notes
                                    </option>

                                    <option value="Sports">
                                        Sports
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>

                                </select>

                            </div>

                            <div className="sell-input-group">

                                <label>
                                    Condition
                                </label>

                                <select
                                    name="condition"
                                    value={formData.condition}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">
                                        Select condition
                                    </option>

                                    <option value="New">
                                        New
                                    </option>

                                    <option value="Like New">
                                        Like New
                                    </option>

                                    <option value="Read Once">Read Once</option>

                                    <option value="Good">
                                        Good
                                    </option>

                                    <option value="Used">
                                        Used
                                    </option>

                                </select>

                            </div>

                        </div>

                        {error && (
                            <div className="sell-alert error">
                                ⚠ {error}
                            </div>
                        )}

                        {message && (
                            <div className="sell-alert success">
                                ✓ {message}
                            </div>
                        )}

                        <div className="sell-actions">

                            <button
                                type="button"
                                className="cancel-button"
                                onClick={onBack}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="list-product-button"
                                disabled={loading}
                            >
                                {loading
                                    ? "Listing Product..."
                                    : "List Product"}
                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>
    );
}

export default SellProduct;
