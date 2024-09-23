const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    obj_picture: {
        type: String,
        required: true,
    },
    object_subtype: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    note: {
        type: String,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            required: true
        }
    ],
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "like" // Store the ID of the users who liked the post
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
