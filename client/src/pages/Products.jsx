import { useEffect, useState } from "react";
import { handleProductImageError, productImageFallback } from "../utils/productImage.js";

function Products({ onBack, onProductClick }) {

    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [sort, setSort] = useState("popular");
    const [acquisition, setAcquisition] = useState("all");
    const [savedIds, setSavedIds] = useState([]);
    const [savedOnly, setSavedOnly] = useState(false);
    const [myOnly, setMyOnly] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // =========================
    // FETCH PRODUCTS
    // =========================

    useEffect(() => {
        fetchProducts();
    }, [search, category, sort, acquisition]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch(`${import.meta.env.VITE_API_URL || ""}/api/saved-products`, { headers: { Authorization: `Bearer ${token}` } })
            .then((response) => response.ok ? response.json() : { products: [] })
            .then((data) => setSavedIds((data.products || []).map((product) => product._id)))
            .catch(() => setSavedIds([]));
    }, []);


    const fetchProducts = async () => {

        try {

            setLoading(true);
            setError("");


            const params = new URLSearchParams();
            if (search.trim()) params.set("search", search.trim());
            if (category !== "All") params.set("category", category);
            if (sort) params.set("sort", sort);
            if (acquisition !== "all") params.set("acquisition", acquisition);
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || ""}/api/products?${params}`
            );


            const result = await response.json();


            console.log(
                "PRODUCT API RESPONSE:",
                result
            );


            if (!response.ok) {

                throw new Error(
                    result.message ||
                    "Failed to load products"
                );

            }


            /*
             Handle different backend
             response formats.
            */

            let productList = [];


            if (Array.isArray(result)) {

                productList = result;

            }
            else if (
                result &&
                Array.isArray(result.products)
            ) {

                productList = result.products;

            }
            else if (
                result &&
                Array.isArray(result.data)
            ) {

                productList = result.data;

            }


            console.log(
                "PRODUCT LIST:",
                productList
            );


            setProducts(productList);


        } catch (error) {

            console.error(
                "PRODUCT FETCH ERROR:",
                error
            );


            setError(
                error.message ||
                "Unable to load products"
            );


        } finally {

            setLoading(false);

        }

    };

    const toggleSaved = async (product) => {
        const token = localStorage.getItem("token");
        const saved = savedIds.includes(product._id);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/saved-products/${product._id}`, {
                method: saved ? "DELETE" : "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Unable to update saved products");
            setSavedIds((current) => saved ? current.filter((id) => id !== product._id) : [...current, product._id]);
            setError("");
        } catch (err) { setError(err.message); }
    };

    const removeListing = async (product) => {
        if (!window.confirm(`Remove “${product.title}” from the marketplace?`)) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/products/${product._id}`, {
                method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Unable to remove listing");
            setProducts((current) => current.filter((item) => item._id !== product._id));
        } catch (err) { setError(err.message); }
    };


    // =========================
    // SEARCH + CATEGORY
    // =========================

    const currentUser = JSON.parse(localStorage.getItem("user") || "null");
    const currentUserId = currentUser?.id || currentUser?._id;
    const filteredProducts = products.filter((product) =>
        (!savedOnly || savedIds.includes(product._id)) &&
        (!myOnly || (product.seller?._id || product.seller) === currentUserId)
    );


    // =========================
    // PAGE
    // =========================

    return (

        <div className="products-page">


            {/* =========================
                HEADER
            ========================= */}

            <header className="products-page-header">

                <button
                    className="products-back-button"
                    onClick={onBack}
                >
                    ← Dashboard
                </button>


                <div className="products-title-section">

                    <span className="products-small-title">
                        StudentMart Marketplace
                    </span>


                    <h1>
                        Browse Products
                    </h1>


                    <p>
                        Find useful products listed by
                        students on your campus.
                    </p>

                </div>

            </header>


            {/* =========================
                FILTERS
            ========================= */}

            <section className="products-filter-section">


                {/* SEARCH */}

                <div className="search-box">

                    <span>
                        ⌕
                    </span>


                    <input
                        type="text"
                        placeholder="Search products by name..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                </div>


                {/* CATEGORY */}

                <select
                    className="product-select"
                    value={category}
                    onChange={(e) =>
                        setCategory(e.target.value)
                    }
                >

                    <option value="All">
                        All Categories
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

                <select className="product-select" value={acquisition} onChange={(e) => setAcquisition(e.target.value)} aria-label="Filter by purchase or swap">
                    <option value="all">Buy or rent</option>
                    <option value="rent-swap">Rent or swap available</option>
                </select>


                {/* SORT */}

                <select
                    className="product-select"
                    value={sort}
                    onChange={(e) =>
                        setSort(e.target.value)
                    }
                >

                    <option value="">
                        Sort by Price
                    </option>

                    <option value="lowToHigh">
                        Price: Low to High
                    </option>

                    <option value="highToLow">
                        Price: High to Low
                    </option>
                    <option value="popular">Most popular</option>

                </select>

            </section>


            {/* =========================
                RESULT COUNT
            ========================= */}

            <div className="products-result-bar">

                <div>

                    <strong>
                        {filteredProducts.length}
                    </strong>

                    {" "}

                    {filteredProducts.length === 1
                        ? "product"
                        : "products"}

                    {" "}found

                </div>


                    {(search ||
                    category !== "All" ||
                    sort || acquisition !== "all" || savedOnly || myOnly) && (

                    <button
                        className="clear-filter-button"

                        onClick={() => {

                            setSearch("");
                            setCategory("All");
                            setSort("");
                            setAcquisition("all");
                            setSavedOnly(false);
                            setMyOnly(false);

                        }}
                    >
                        Clear Filters
                    </button>

                )}

                <button type="button" className={`saved-filter-button${savedOnly ? " active" : ""}`} onClick={() => setSavedOnly((value) => !value)}>♡ {savedOnly ? "Showing saved" : `Saved (${savedIds.length})`}</button>
                <button type="button" className={`saved-filter-button${myOnly ? " active" : ""}`} onClick={() => setMyOnly((value) => !value)}>{myOnly ? "My listings" : "My listings only"}</button>
            </div>


            {/* =========================
                LOADING
            ========================= */}

            {loading && (

                <div className="products-status">

                    <div className="products-spinner"></div>

                    <h3>
                        Loading products...
                    </h3>

                </div>

            )}


            {/* =========================
                ERROR
            ========================= */}

            {!loading && error && (

                <div className="products-status">

                    <div className="status-icon">
                        !
                    </div>


                    <h3>
                        Unable to load products
                    </h3>


                    <p>
                        {error}
                    </p>


                    <button
                        className="retry-button"
                        onClick={fetchProducts}
                    >
                        Try Again
                    </button>

                </div>

            )}


            {/* =========================
                NO PRODUCTS
            ========================= */}

            {!loading &&
                !error &&
                filteredProducts.length === 0 && (

                    <div className="products-status">

                        <div className="status-icon">
                            📦
                        </div>


                        <h3>
                            No products found
                        </h3>


                        <p>
                            Try another search or category.
                        </p>

                    </div>

                )
            }


            {/* =========================
                PRODUCT GRID
            ========================= */}

            {!loading &&
                !error &&
                filteredProducts.length > 0 && (

                    <div className="products-grid">

                        {filteredProducts.map(
                            (product, index) => (

                                <article
                                    className="product-card"
                                    key={product._id}
                                >


                                    {/* IMAGE */}

                                    <img className="product-card-image" src={product.image || productImageFallback(product)} alt={product.title} loading={index < 4 ? "eager" : "lazy"} fetchPriority={index < 2 ? "high" : "auto"} decoding="async" onError={(event) => handleProductImageError(event, product)} />


                                    {/* CONTENT */}

                                    <div className="product-card-content">


                                        <div className="product-card-top">

                                            <span className="product-category-badge">

                                                {product.category}

                                            </span>


                                            <span className="product-condition">

                                                {product.condition}

                                            </span>

                                        </div>

                                        <button type="button" className={`save-product-button${savedIds.includes(product._id) ? " saved" : ""}`} onClick={() => toggleSaved(product)} aria-label={savedIds.includes(product._id) ? "Remove saved product" : "Save product"}>{savedIds.includes(product._id) ? "♥ Saved" : "♡ Save"}</button>
                                        {(product.seller?._id || product.seller) === currentUserId && <button type="button" className="remove-listing-button" onClick={() => removeListing(product)}>Remove listing</button>}


                                        <h2>
                                            {product.title}
                                        </h2>

                                        {product.author && <p className="product-author">by {product.author}</p>}
                                        <span className="product-view-count">◉ {Number(product.views || 0)} views</span>


                                        <p className="product-description">

                                            {product.description}

                                        </p>


                                        <div className="product-card-footer">

                                            <div className="product-price">

                                                ₹
                                                {product.price}

                                            </div>

                                        </div>

                                        {(product.rentPrice > 0 || product.allowSwap) && <div className="product-acquisition-tags">{product.rentPrice > 0 && <span>Rent ₹{product.rentPrice}/wk</span>}{product.allowSwap && <span>Swap available</span>}</div>}


                                        <button
                                            className="view-details-button"

                                            onClick={() =>
                                                onProductClick(
                                                    product
                                                )
                                            }
                                        >

                                            View Details →

                                        </button>


                                    </div>

                                </article>

                            )
                        )}

                    </div>

                )}

        </div>

    );
}


export default Products;
