const mongoose = require(`mongoose`);

const OrderSchema = new mongoose.Schema({
    items: {
        type: [Object],
        required: true,
    },
    invoice_id: {
        type: String,
        required: true,
        trim: true
    },
    payment_id: {
        type: String,
        required: true,
        trim: true
    },
    customer: {
        type: Object,
        required: true
    },
    guest_account: {
        type: String,
        required: true,
        trim: true
    },
    user_id: {
        type: String,
        required: true,
        trim: true
    },
    order_type: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true
    },
    delivery_status: {
        type: String,
        default: `undelivered`,
        required: true,
        trim: true
    },
    invoice: {
        type: String,
        required: true,
        trim: true
    }
}, {
    strict: false,
    timestamps: true
});

module.exports = mongoose.model(`Order`, OrderSchema);