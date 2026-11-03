require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");
const User = require("./models/User");

// Product titles are intentionally sample campus listings. Replace or delete
// them after adding real student listings.
const catalog = {
    "Books": [
        ["Atomic Habits", 250, "James Clear"], ["The Psychology of Money", 220, "Morgan Housel"],
        ["Ikigai", 180, "Héctor García"], ["The Alchemist", 150, "Paulo Coelho"],
        ["Think Like a Monk", 200, "Jay Shetty"], ["Wings of Fire", 190, "A. P. J. Abdul Kalam"],
        ["Deep Work", 240, "Cal Newport"], ["The Power of Now", 210, "Eckhart Tolle"],
        ["Sapiens", 300, "Yuval Noah Harari"], ["The 5 AM Club", 230, "Robin Sharma"]
    ],
    "Story & Novels": [
        ["Harry Potter and the Philosopher's Stone", 220, "J. K. Rowling"], ["The Hobbit", 200, "J. R. R. Tolkien"],
        ["Sherlock Holmes: Selected Stories", 180, "Arthur Conan Doyle"], ["The Great Gatsby", 140, "F. Scott Fitzgerald"],
        ["The Book Thief", 240, "Markus Zusak"], ["Malgudi Days", 160, "R. K. Narayan"],
        ["The Girl on the Train", 210, "Paula Hawkins"], ["Pride and Prejudice", 170, "Jane Austen"],
        ["The Silent Patient", 230, "Alex Michaelides"], ["The Kite Runner", 190, "Khaled Hosseini"]
    ],
    "Books & Non-Fiction": [
        ["India After Gandhi", 320, "Ramachandra Guha"], ["Surely You're Joking, Mr. Feynman!", 280, "Richard Feynman"],
        ["A Brief History of Time", 250, "Stephen Hawking"], ["The Diary of a Young Girl", 180, "Anne Frank"],
        ["The Story of My Experiments with Truth", 210, "M. K. Gandhi"], ["Factfulness", 260, "Hans Rosling"],
        ["Educated", 240, "Tara Westover"], ["The Code Book", 300, "Simon Singh"],
        ["Born a Crime", 230, "Trevor Noah"], ["The Wright Brothers", 220, "David McCullough"]
    ],
    "Textbooks": [
        ["Introduction to Algorithms", 650, "Thomas H. Cormen"], ["Database System Concepts", 520, "Abraham Silberschatz"],
        ["Operating System Concepts", 580, "Abraham Silberschatz"], ["Computer Networks", 430, "Andrew S. Tanenbaum"],
        ["Artificial Intelligence: A Modern Approach", 720, "Stuart Russell"], ["Engineering Mathematics I", 300, "B. S. Grewal"],
        ["Data Structures and Algorithms in C", 380, "Mark Allen Weiss"], ["Digital Logic Design", 340, "M. Morris Mano"],
        ["Fundamentals of Physics", 490, "Halliday, Resnick & Walker"], ["Software Engineering", 420, "Ian Sommerville"]
    ],
    "Lab & Hostel": [
        ["Digital Multimeter", 280, "Campus Lab"], ["Soldering Iron Kit", 350, "Campus Lab"],
        ["Breadboard and Jumper Wire Set", 160, "Campus Lab"], ["Lab Coat, Size M", 220, "Campus Store"],
        ["Safety Goggles", 90, "Campus Store"], ["Scientific Calculator", 450, "Casio"],
        ["Hostel Study Lamp", 240, "Campus Essentials"], ["Insulated Water Bottle", 180, "Campus Essentials"],
        ["Extension Board, 4 Socket", 260, "Campus Essentials"], ["Laundry Basket", 150, "Campus Essentials"]
    ],
    "Electronics": [
        ["Wireless Mouse", 350, "Logitech"], ["USB-C Earphones", 280, "Campus Tech"],
        ["Bluetooth Speaker", 650, "JBL"], ["USB-C Hub, 4 Port", 520, "Portronics"],
        ["Mechanical Keyboard", 1200, "Redragon"], ["Power Bank, 10000 mAh", 750, "Ambrane"],
        ["Laptop Stand", 480, "Amazon Basics"], ["Webcam, 1080p", 900, "Logitech"],
        ["Scientific Calculator FX-991", 550, "Casio"], ["Type-C Fast Charger", 400, "Anker"]
    ],
    "Furniture": [
        ["Foldable Study Table", 850, "Campus Furniture"], ["Ergonomic Study Chair", 1400, "Campus Furniture"],
        ["Bookshelf, 3 Tier", 700, "Campus Furniture"], ["Bedside Table", 550, "Campus Furniture"],
        ["Plastic Storage Drawer", 480, "Campus Furniture"], ["Laptop Desk for Bed", 350, "Campus Furniture"],
        ["Dorm Room Shoe Rack", 420, "Campus Furniture"], ["Wall Shelf Set", 300, "Campus Furniture"],
        ["Bean Bag Chair", 1100, "Campus Furniture"], ["Study Chair Cushion", 250, "Campus Furniture"]
    ],
    "Clothing": [
        ["College Hoodie, Size M", 450, "Campus Wear"], ["Lab Coat, Size L", 220, "Campus Wear"],
        ["Sports Jersey, Size M", 300, "Campus Wear"], ["Denim Jacket, Size S", 550, "Campus Wear"],
        ["Formal Shirt, Size L", 350, "Campus Wear"], ["Rain Jacket, One Size", 420, "Campus Wear"],
        ["Winter Scarf", 180, "Campus Wear"], ["Campus Club T-Shirt, Size M", 200, "Campus Wear"],
        ["Track Pants, Size L", 280, "Campus Wear"], ["Canvas Backpack", 500, "Campus Wear"]
    ],
    "Notes": [
        ["Data Structures Complete Notes", 80, "CSE Student"], ["DBMS Exam Notes", 70, "CSE Student"],
        ["Operating Systems Revision Notes", 75, "CSE Student"], ["Engineering Mathematics Formula Book", 60, "Engineering Student"],
        ["Computer Networks Handwritten Notes", 90, "CSE Student"], ["Digital Electronics Notes", 65, "ECE Student"],
        ["Physics Lab Record", 100, "Engineering Student"], ["Java Programming Quick Notes", 55, "CSE Student"],
        ["Microprocessors Question Bank", 85, "ECE Student"], ["First Year Chemistry Notes", 70, "Engineering Student"]
    ],
    "Sports": [
        ["Yonex Badminton Racket", 650, "Yonex"], ["Cosco Football Size 5", 480, "Cosco"],
        ["Cricket Bat, English Willow", 1200, "SG"], ["Basketball, Size 7", 550, "Nivia"],
        ["Skipping Rope", 120, "Decathlon"], ["Yoga Mat", 300, "Boldfit"],
        ["Table Tennis Paddle Set", 350, "Stag"], ["Adjustable Dumbbells, Pair", 900, "Fitness Gear"],
        ["Badminton Shuttlecock Pack", 180, "Yonex"], ["Cricket Kit Bag", 700, "SG"]
    ],
    "Other": [
        ["Scientific Drawing Set", 140, "Campus Supplies"], ["Reusable Coffee Mug", 120, "Campus Essentials"],
        ["Desk Organizer", 160, "Campus Essentials"], ["Analog Wrist Watch", 350, "Campus Finds"],
        ["Mini Whiteboard with Marker", 180, "Campus Supplies"], ["Art Sketching Kit", 260, "Campus Supplies"],
        ["Travel Neck Pillow", 220, "Campus Essentials"], ["Reusable Lunch Box", 190, "Campus Essentials"],
        ["Compact Umbrella", 250, "Campus Essentials"], ["Board Game Set", 300, "Campus Finds"]
    ]
};

const imageFor = (category) => `/product-images/${category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}.svg`;

async function seedProducts() {
    await mongoose.connect(process.env.MONGO_URI);
    const sellerEmail = process.env.SEED_SELLER_EMAIL?.toLowerCase();
    const seller = sellerEmail
        ? await User.findOne({ email: sellerEmail })
        : await User.findOne().sort({ createdAt: 1 });
    if (!seller) throw new Error("No user found. Register a user first, or set SEED_SELLER_EMAIL in server/.env.");

    let inserted = 0;
    for (const [category, items] of Object.entries(catalog)) {
        if (items.length !== 10) throw new Error(`${category} must contain exactly 10 sample items`);
        for (const [index, [title, price, author]] of items.entries()) {
            const seedKey = `studentmart-demo:${category}:${index + 1}`;
            const isBook = /book|novel|story|textbook|notes/i.test(category);
            const product = {
                seedKey, title, author: isBook ? author : "", category,
                description: `Sample campus listing for ${title}. Update this description and contact the seller before purchase.`,
                price, originalPrice: Math.round(price * 1.35), rentPrice: isBook ? Math.max(20, Math.round(price * 0.12)) : 0,
                condition: index % 3 === 0 ? "Like New" : "Good", image: imageFor(category), stock: 1,
                pickup: "Campus Library / Main Gate", allowSwap: isBook && index % 2 === 0,
                views: 35 - index, seller: seller._id
            };
            const result = await Product.updateOne({ seedKey }, { $setOnInsert: product }, { upsert: true });
            if (result.upsertedCount) inserted += 1;
        }
    }
    console.log(`Seeded ${inserted} sample products; ${Object.keys(catalog).length * 10 - inserted} already existed. Seller: ${seller.name} (${seller.email}).`);
}

seedProducts()
    .catch((error) => { console.error("Product seeding failed:", error.message); process.exitCode = 1; })
    .finally(async () => { if (mongoose.connection.readyState) await mongoose.disconnect(); });
