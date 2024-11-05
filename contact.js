// Contact.js
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    email: String,
    phoneNumber: String,
    linkedId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contact',
        default: null
    },
    linkPrecedence: {
        type: String,
        enum: ['primary', 'secondary'],
        default: 'primary'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    deletedAt: Date
});

contactSchema.index({ email: 1, phoneNumber: 1 }, { unique: false });

module.exports = mongoose.model('Contact', contactSchema);
