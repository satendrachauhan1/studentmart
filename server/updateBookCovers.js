require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const categories = ["Books", "Story & Novels", "Books & Non-Fiction", "Textbooks"];
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const normalize = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

async function lookupCover(product) {
    const params = new URLSearchParams({ title: product.title, author: product.author || "", limit: "5", fields: "title,author_name,cover_i,key" });
    const response = await fetch(`https://openlibrary.org/search.json?${params}`, {
        headers: { "User-Agent": "StudentMartCampusMarketplace/1.0 (student project)" },
        signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) throw new Error(`Open Library returned HTTP ${response.status}`);
    const data = await response.json();
    const title = normalize(product.title);
    const author = normalize(product.author);
    const candidates = (data.docs || []).filter((doc) => doc.cover_i && doc.key);
    candidates.sort((a, b) => {
        const score = (doc) => {
            const resultTitle = normalize(doc.title);
            const titleMatch = resultTitle === title ? 4 : resultTitle.startsWith(title) || title.startsWith(resultTitle) ? 2 : 0;
            const authors = (doc.author_name || []).map(normalize);
            const authorMatch = authors.some((name) => name === author || name.includes(author) || author.includes(name)) ? 2 : 0;
            return titleMatch + authorMatch;
        };
        return score(b) - score(a);
    });
    const match = candidates[0];
    if (!match || !normalize(match.title)) return null;
    return {
        image: `https://covers.openlibrary.org/b/id/${match.cover_i}-M.jpg?default=false`,
        imageCreditUrl: `https://openlibrary.org${match.key}`,
        matchedTitle: match.title
    };
}

async function updateCovers() {
    await mongoose.connect(process.env.MONGO_URI);
    const books = await Product.find({ seedKey: /^studentmart-demo:/, category: { $in: categories }, image: /^\/product-covers\// }).sort({ category: 1, title: 1 });
    let updated = 0;
    let unavailable = 0;
    for (const [index, product] of books.entries()) {
        try {
            const cover = await lookupCover(product);
            if (cover) {
                product.image = cover.image;
                product.imageCreditUrl = cover.imageCreditUrl;
                await product.save();
                updated += 1;
                console.log(`Cover matched: ${product.title} → ${cover.matchedTitle}`);
            } else {
                unavailable += 1;
                console.log(`No catalog cover: ${product.title} (keeping its custom local cover)`);
            }
        } catch (error) {
            unavailable += 1;
            console.warn(`Cover lookup skipped for ${product.title}: ${error.message}`);
        }
        // Open Library asks clients to keep search requests to roughly one per second.
        if (index < books.length - 1) await wait(1100);
    }
    console.log(`Assigned ${updated} catalog covers; ${unavailable} books keep their custom local covers.`);
}

updateCovers()
    .catch((error) => { console.error("Cover update failed:", error.message); process.exitCode = 1; })
    .finally(async () => { if (mongoose.connection.readyState) await mongoose.disconnect(); });
