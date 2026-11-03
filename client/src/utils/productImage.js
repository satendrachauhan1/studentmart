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
    if (product?.seedKey && product?._id && /^(Books|Story & Novels|Books & Non-Fiction|Textbooks|Notes)$/.test(product.category || "")) {
        return `/product-covers/${product._id}.svg`;
    }
    return `/product-images/${categoryImages[product?.category] || categoryImages.Other}`;
}

export function handleProductImageError(event, product) {
    event.currentTarget.onerror = null;
    event.currentTarget.src = productImageFallback(product);
}
