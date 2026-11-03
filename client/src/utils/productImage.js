const categoryImages = {
    "Books": "books.svg",
    "Story & Novels": "story-novels.svg",
    "Books & Non-Fiction": "books-non-fiction.svg",
    "Textbooks": "textbooks.svg",
    "Lab & Hostel": "lab-hostel.svg",
    "Electronics": "electronics.svg",
    "Furniture": "furniture.svg",
    "Clothing": "clothing.svg",
    "Notes": "notes.svg",
    "Sports": "sports.svg",
    "Other": "other.svg"
};

export function productImageFallback(product) {
    const base = import.meta.env.BASE_URL || "/";
    if (product?.seedKey && product?._id && /^(Books|Story & Novels|Books & Non-Fiction|Textbooks|Notes)$/.test(product.category || "")) {
        return `${base}product-covers/${product._id}.svg`;
    }
    return `${base}product-images/${categoryImages[product?.category] || categoryImages.Other}`;
}

export function resolveProductImage(image, product) {
    if (!image) return productImageFallback(product);
    if (/^(https?:|data:|blob:)/i.test(image)) return image;
    const base = import.meta.env.BASE_URL || "/";
    return `${base}${String(image).replace(/^\/+/, "")}`;
}

export function handleProductImageError(event, product) {
    event.currentTarget.onerror = null;
    event.currentTarget.src = productImageFallback(product);
}
