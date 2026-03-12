const mongoose = require("mongoose");

const dprSchema = new mongoose.Schema({
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
        trim: true
    },
    weather: {
        type: String,
        enum: ['sunny', 'cloudy', 'rainy', 'stormy', 'windy', 'foggy'],
        required: true
    },
    worker_count: {
        type: Number,
        required: true,
        min: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
}, { timestamps: true });

const dprModel = mongoose.model("dpr", dprSchema);

module.exports = dprModel;