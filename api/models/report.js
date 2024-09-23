const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    report: {
        type: String,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    blog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;