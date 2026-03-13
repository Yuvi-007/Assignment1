const mongoose = require("mongoose");

/**
 * @description  Schema for construction projects. A project is the top-level entity
 *               in this system — users, DPRs, and tasks all hang off a project.
 *               Automatically tracks creation and update timestamps.
 */
const projectSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        trim: true
    },

    startDate: {
        type: Date,
        required: true
    },

    endDate: {
        type: Date,
        required: true
    },

    budget: {
        type: Number,
        required: true,
        min: 0  // Prevents negative budget values
    },

    location: {
        type: String,
        trim: true
    },

    // Lifecycle status of the project — defaults to 'planning' on creation.
    // Use this field to filter projects by their current stage via GET /projects?status=
    status: {
        type: String,
        enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled'],
        default: 'planning'
    },

    // The admin or manager who created this project — populated from req.user.id
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }

}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

const projectModel = mongoose.model("project", projectSchema);

module.exports = projectModel;