const express = require('express');
const connectDB = require('./db');
const Contact = require('./Contact');

const app = express();
app.use(express.json());

connectDB();

// Helper function to check for slight variations
function isSlightVariation(a, b) {
    // For phone numbers, allow a 1-digit difference
    if (/^\d+$/.test(a) && /^\d+$/.test(b)) {
        let differenceCount = 0;
        for (let i = 0; i < Math.max(a.length, b.length); i++) {
            if (a[i] !== b[i]) differenceCount++;
            if (differenceCount > 1) return false;
        }
        return true;
    }

    // For emails, check if only one character in local part is different
    const [localA, domainA] = a.split('@');
    const [localB, domainB] = b.split('@');
    if (domainA === domainB && Math.abs(localA.length - localB.length) <= 1) {
        let diffCount = 0;
        for (let i = 0; i < Math.min(localA.length, localB.length); i++) {
            if (localA[i] !== localB[i]) diffCount++;
            if (diffCount > 1) return false;
        }
        return true;
    }

    return false;
}

// Helper function to recursively find the primary contact
async function findPrimaryContact(contact) {
    while (contact.linkedId) {
        contact = await Contact.findById(contact.linkedId);
    }
    return contact;
}

app.post('/identify', async (req, res) => {
    const { email, phoneNumber } = req.body;

    try {
        // Step 1: Find all contacts that match either email, phone, or slight variations
        const contacts = await Contact.find({
            $or: [
                { email },
                { phoneNumber },
                { email: { $regex: new RegExp(`^${email.split('@')[0].slice(0, -1)}`) } },
                { phoneNumber: { $regex: new RegExp(`^${phoneNumber.slice(0, -1)}`) } }
            ],
            deletedAt: { $exists: false }
        });

        let primaryContact;

        if (contacts.length === 0) {
            // No matches, create a new primary contact
            primaryContact = new Contact({
                email,
                phoneNumber,
                linkPrecedence: 'primary'
            });
            await primaryContact.save();
        } else {
            // Step 2: Check for exact or slight variation matches
            const exactOrSimilarMatches = contacts.filter(contact => 
                contact.email === email || 
                contact.phoneNumber === phoneNumber || 
                isSlightVariation(contact.email, email) || 
                isSlightVariation(contact.phoneNumber, phoneNumber)
            );

            primaryContact = await findPrimaryContact(exactOrSimilarMatches[0]);

            // Step 3: Link all exact or similar contacts to the primary
            for (let contact of exactOrSimilarMatches) {
                if (contact._id.toString() !== primaryContact._id.toString()) {
                    await Contact.findByIdAndUpdate(contact._id, {
                        linkedId: primaryContact._id,
                        linkPrecedence: 'secondary'
                    });
                }
            }
        }

        // Step 4: Fetch all contacts linked to the primary contact for aggregation
        const allContacts = await Contact.find({
            $or: [
                { _id: primaryContact._id },
                { linkedId: primaryContact._id }
            ],
            deletedAt: { $exists: false }
        });

        // Aggregate unique emails, phone numbers, and secondary contact IDs
        const emails = [...new Set(allContacts.map(contact => contact.email).filter(Boolean))];
        const phoneNumbers = [...new Set(allContacts.map(contact => contact.phoneNumber).filter(Boolean))];
        const secondaryContactIds = allContacts
            .filter(contact => contact.linkPrecedence === 'secondary')
            .map(contact => contact._id.toString());

        // Step 5: Return a unified response for the primary contact
        res.status(200).json({
            primaryContactId: primaryContact._id.toString(),
            emails,
            phoneNumbers,
            secondaryContactIds
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
