const mongoose = require("mongoose");

/**
 * @description  Schema for Daily Progress Reports (DPRs). Each DPR is tied to a specific
 *               project and records the day's work summary, site conditions, and workforce
 *               count. Automatically tracks creation and update timestamps.
 */
const dprSchema = new mongoose.Schema({

    // Reference to the parent project — DPRs cannot exist without a valid project
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'project',
        required: true
    },

    date: {
        type: Date,
        required: true
    },

    work_description: {
        type: String,
        required: true,
        trim: true  // Strips leading/trailing whitespace before saving
    },

    // Restricted to a fixed set of values to ensure consistent data for reporting/filtering
    weather: {
        type: String,
        enum: ['sunny', 'cloudy', 'rainy', 'stormy', 'windy', 'foggy'],
        required: true
    },

    worker_count: {
        type: Number,
        required: true,
        min: 0  // Prevents negative worker counts
    },

    // The user who filed this DPR — populated from req.user.id set by auth middleware
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }

}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

const dprModel = mongoose.model("dpr", dprSchema);

module.exports = dprModel;