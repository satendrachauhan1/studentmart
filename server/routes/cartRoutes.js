const express = require("express");
const mongoose = require("mongoose");

const Cart = require("../models/Cart");
const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// GET USER CART
// =====================================================

router.get("/", authMiddleware, async (req, res) => {
    try {

        let cart = await Cart.findOne({
            user: req.user.id
        }).populate(
            "items.product",
            "title description price rentPrice image category condition seller"
        );


        // Create empty cart if user doesn't have one

        if (!cart) {

            cart = await Cart.create({
                user: req.user.id,
                items: []
            });

        }


        res.status(200).json({
            cart
        });

    } catch (error) {

        console.error(
            "GET CART ERROR:",
            error
        );

        res.status(500).json({
            message: "Unable to load cart",
            error: error.message
        });
    }
});


// =====================================================
// ADD PRODUCT TO CART
// =====================================================

router.post("/", authMiddleware, async (req, res) => {
    try {

        const {
            productId,
            quantity = 1,
            purchaseType = "buy"
        } = req.body;


        console.log(
            "ADD TO CART:",
            productId,
            quantity
        );


        // Validate product ID

        if (
            !productId ||
            !mongoose.Types.ObjectId.isValid(productId)
        ) {

            return res.status(400).json({
                message: "Invalid product ID"
            });

        }


        // Check product exists

        const product =
            await Product.findById(productId);


        if (!product) {

            return res.status(404).json({
                message: "Product not found"
            });

        }

        if (!["buy", "rent"].includes(purchaseType) || (purchaseType === "rent" && !(product.rentPrice > 0))) {
            return res.status(400).json({ message: "This product is not available for that option" });
        }


        // Find user's cart

        let cart =
            await Cart.findOne({
                user: req.user.id
            });


        // Create cart if necessary

        if (!cart) {

            cart = new Cart({
                user: req.user.id,
                items: []
            });

        }


        // Check if product already exists

        const existingItem =
            cart.items.find(
                (item) =>
                    item.product.toString() ===
                    productId
            );


        if (existingItem) {

            if (existingItem.purchaseType !== purchaseType) {
                return res.status(409).json({ message: "This item is already in your cart with a different purchase option" });
            }

            existingItem.quantity +=
                Math.max(
                    1,
                    Number(quantity)
                );

        } else {

            cart.items.push({
                product: productId,
                purchaseType,
                quantity: Math.max(
                    1,
                    Number(quantity)
                )
            });

        }


        await cart.save();


        // Populate products before returning

        await cart.populate(
            "items.product",
            "title description price rentPrice image category condition seller"
        );


        res.status(200).json({
            message:
                "Product added to cart successfully",

            cart
        });

    } catch (error) {

        console.error(
            "ADD TO CART ERROR:",
            error
        );

        res.status(500).json({
            message: "Unable to add product to cart",
            error: error.message
        });
    }
});


// =====================================================
// UPDATE PRODUCT QUANTITY
// =====================================================

router.put(
    "/:productId",
    authMiddleware,
    async (req, res) => {

        try {

            const {
                quantity
            } = req.body;


            const newQuantity =
                Number(quantity);


            if (
                !Number.isInteger(newQuantity) ||
                newQuantity < 1
            ) {

                return res.status(400).json({
                    message:
                        "Quantity must be at least 1"
                });

            }


            const cart =
                await Cart.findOne({
                    user: req.user.id
                });


            if (!cart) {

                return res.status(404).json({
                    message: "Cart not found"
                });

            }


            const item =
                cart.items.find(
                    (item) =>
                        item.product.toString() ===
                        req.params.productId
                );


            if (!item) {

                return res.status(404).json({
                    message:
                        "Product not found in cart"
                });

            }


            item.quantity =
                newQuantity;


            await cart.save();


            await cart.populate(
                "items.product",
                "title description price rentPrice image category condition seller"
            );


            res.status(200).json({
                message:
                    "Cart updated successfully",

                cart
            });

        } catch (error) {

            console.error(
                "UPDATE CART ERROR:",
                error
            );

            res.status(500).json({
                message:
                    "Unable to update cart",
                error: error.message
            });
        }
    }
);


// =====================================================
// REMOVE PRODUCT FROM CART
// =====================================================

router.delete(
    "/:productId",
    authMiddleware,
    async (req, res) => {

        try {

            const cart =
                await Cart.findOne({
                    user: req.user.id
                });


            if (!cart) {

                return res.status(404).json({
                    message: "Cart not found"
                });

            }


            const oldLength =
                cart.items.length;


            cart.items =
                cart.items.filter(
                    (item) =>
                        item.product.toString() !==
                        req.params.productId
                );


            if (
                cart.items.length ===
                oldLength
            ) {

                return res.status(404).json({
                    message:
                        "Product not found in cart"
                });

            }


            await cart.save();


            await cart.populate(
                "items.product",
                "title description price rentPrice image category condition seller"
            );


            res.status(200).json({
                message:
                    "Product removed from cart",

                cart
            });

        } catch (error) {

            console.error(
                "REMOVE CART ERROR:",
                error
            );

            res.status(500).json({
                message:
                    "Unable to remove product",
                error: error.message
            });
        }
    }
);


module.exports = router;
