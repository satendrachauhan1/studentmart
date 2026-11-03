const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        phone: {
            type: String,
            trim: true,
            default: "",
            maxlength: 20
        },

        bio: {
            type: String,
            trim: true,
            default: "",
            maxlength: 300
        },

        studentId: { type: String, trim: true, default: "", maxlength: 30 },
        department: { type: String, trim: true, default: "", maxlength: 100 },
        semester: { type: String, trim: true, default: "", maxlength: 40 },
        pickupLocation: { type: String, trim: true, default: "", maxlength: 120 },
        gender: { type: String, enum: ["", "male", "female", "prefer-not-to-say"], default: "" },

        password: {
            type: String,
            required: true,
            minlength: 6
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);
