const mongoose = require("mongoose");

/**
 * @description  Schema for user accounts. Handles all three roles in the system —
 *               regular users, managers, and admins. Passwords are stored as bcrypt
 *               hashes (handled in the auth controller, not here). Automatically
 *               tracks creation and update timestamps.
 */
const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    // Must be unique across the collection — used as an alternative login identifier
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    // Never stored as plain text — always bcrypt-hashed before reaching this model
    password: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true,   // Prevents duplicate accounts under different usernames
        trim: true,
        lowercase: true // Normalizes email to lowercase so 'User@Email.com' and 'user@email.com' are treated as the same
    },

    phone: {
        type: String,
        trim: true
    },

    // Controls what routes and resources the user can access.
    // 'admin' accounts are never created through self-registration — see seedAdmin in auth.controller.js
    role: {
        type: String,
        enum: ['user', 'manager', 'admin'],
        default: 'user'
    }

}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;