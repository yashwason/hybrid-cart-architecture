const mongoose = require(`mongoose`);

const ProductSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    color: {
        type: String,
        required: true,
        trim: true
    },
    is_valid: {
        type: Boolean,
        required: true,
        trim: true,
        default: true
    }
}, {
    timestamps: true,
    strict: false
});


module.exports = mongoose.model(`Product`, ProductSchema);