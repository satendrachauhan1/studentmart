require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Product = require("./models/Product");

const categories = ["Books", "Story & Novels", "Books & Non-Fiction", "Textbooks", "Notes"];
const palettes = [
    ["#17324d", "#e5aa55", "#f8e8c8"], ["#492b57", "#e2a55d", "#f7e9d7"],
    ["#194c4c", "#d4a957", "#e5f1e7"], ["#183b78", "#63bdd1", "#e2f0fa"],
    ["#673f2b", "#e2ad58", "#fff0d5"], ["#2d355d", "#d78259", "#f1e2d8"],
    ["#713b42", "#e3bf68", "#f4e7d8"], ["#244958", "#df8d79", "#e3f0ed"]
];

const escapeXml = (value) => String(value || "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]);
const hash = (value) => [...String(value)].reduce((result, char) => (result * 31 + char.charCodeAt(0)) >>> 0, 7);

function titleLines(title, maxLength = 19) {
    const words = String(title || "Campus Book").split(/\s+/);
    const lines = [];
    let line = "";
    for (const word of words) {
        if (line && `${line} ${word}`.length > maxLength) { lines.push(line); line = word; }
        else line = line ? `${line} ${word}` : word;
    }
    if (line) lines.push(line);
    if (lines.length > 4) return [...lines.slice(0, 3), `${lines[3].slice(0, maxLength - 1)}…`];
    return lines;
}

function makeCover(product, index) {
    const [ink, accent, paper] = palettes[hash(product.title) % palettes.length];
    const lines = titleLines(product.title);
    const fontSize = lines.some((line) => line.length > 16) || lines.length > 3 ? 28 : 34;
    const titleMarkup = lines.map((line, lineIndex) => `<tspan x="95" dy="${lineIndex === 0 ? 0 : 39}">${escapeXml(line)}</tspan>`).join("");
    const author = escapeXml(product.author || "Student notes edition");
    const category = escapeXml(product.category || "Campus reading").toUpperCase();
    const motifSize = 40 + (hash(product.title) % 26);
    const seed = hash(`${product.title}:${index}`) % 70;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 640" role="img" aria-label="Cover design for ${escapeXml(product.title)}"><defs><linearGradient id="paper" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${paper}"/><stop offset="1" stop-color="#fff"/></linearGradient><filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="7" dy="10" stdDeviation="10" flood-opacity=".2"/></filter></defs><rect width="480" height="640" fill="#e9edf3"/><g filter="url(#shadow)"><rect x="47" y="32" width="386" height="576" rx="9" fill="url(#paper)"/><rect x="47" y="32" width="24" height="576" rx="8" fill="${ink}"/><rect x="71" y="32" width="362" height="14" fill="${accent}"/><path d="M96 105h285M96 119h176" stroke="${ink}" stroke-opacity=".18" stroke-width="3" stroke-linecap="round"/><circle cx="${320 + seed}" cy="${320 - seed / 2}" r="${motifSize + 34}" fill="${accent}" opacity=".16"/><circle cx="${320 + seed}" cy="${320 - seed / 2}" r="${motifSize}" fill="${accent}" opacity=".84"/><path d="M252 338l66-84 62 84z" fill="${ink}" opacity=".86"/><circle cx="${302 + seed / 3}" cy="${305 - seed / 5}" r="13" fill="${paper}" opacity=".9"/><text x="95" y="153" fill="${ink}" font-family="Georgia,serif" font-size="12" font-weight="700" letter-spacing="3">${category}</text><text x="95" y="222" fill="${ink}" font-family="Georgia,serif" font-size="${fontSize}" font-weight="700">${titleMarkup}</text><path d="M95 453h282" stroke="${accent}" stroke-width="4"/><text x="95" y="489" fill="${ink}" font-family="Arial,sans-serif" font-size="17" font-weight="600">${author}</text><text x="95" y="563" fill="${ink}" fill-opacity=".68" font-family="Arial,sans-serif" font-size="11" letter-spacing="2">STUDENTMART CAMPUS EDITION</text><text x="382" y="580" text-anchor="end" fill="${ink}" fill-opacity=".5" font-family="Arial,sans-serif" font-size="10">${String(index + 1).padStart(2, "0")}</text></g></svg>`;
}

async function createBookCovers() {
    await mongoose.connect(process.env.MONGO_URI);
    const products = await Product.find({ seedKey: /^studentmart-demo:/, category: { $in: categories } }).sort({ category: 1, title: 1 });
    const outputDir = path.join(__dirname, "..", "client", "public", "product-covers");
    fs.mkdirSync(outputDir, { recursive: true });

    for (const [index, product] of products.entries()) {
        const filename = `${product._id}.svg`;
        fs.writeFileSync(path.join(outputDir, filename), makeCover(product, index), "utf8");
        if (!product.imageCreditUrl) product.image = `/product-covers/${filename}`;
        product.views = Math.max(Number(product.views || 0), 200 - index);
        await product.save();
    }
    console.log(`Created and assigned ${products.length} individual local book covers.`);
}

createBookCovers()
    .catch((error) => { console.error("Book cover creation failed:", error.message); process.exitCode = 1; })
    .finally(async () => { if (mongoose.connection.readyState) await mongoose.disconnect(); });
