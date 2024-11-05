# Contact Identification Service

## Overview

This service processes incoming requests containing email addresses and phone numbers to identify potential duplicate contacts, even when they use slightly varied information. Built using Node.js, Express.js, and MongoDB, it provides a robust solution for managing customer data efficiently.

## Features

- Detects and links contacts with slight variations in email addresses and phone numbers.
- Creates new contacts if no existing match is found.
- Links contacts under a primary contact, enabling better data management.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- MongoDB (local instance or a MongoDB Atlas account)
- npm (Node Package Manager)

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/ashutosh029/assignment.git
   cd assignment
   ```

2. **Install dependencies:**

   Navigate to the project directory and run:

   ```bash
   npm install
   ```

3. **Update Credentilals:**

   Replace `<username>`, `<password>`, and `<dbname>` with your MongoDB credentials and desired database name.

## Code Structure

- `db.js`: Responsible for connecting to the MongoDB database.
- `Contact.js`: Mongoose model defining the structure of the Contact document.
- `index.js`: Main file where the Express server is set up and the API endpoint is defined.

## Running the Service

1. **Start the MongoDB server:**

   If you are using a local MongoDB instance, ensure that it is running. For example, you can start it using:

   ```bash
   mongod
   ```

2. **Run the application:**

   Execute the following command in your project directory:

   ```bash
   node index.js
   ```

   You should see output indicating that the server is running:

   ```
   Server running on port 3000
   ```

## API Endpoint

### POST `/identify`

#### Request Body

The request should include a JSON payload containing:

```json
{
    "email": "user@example.com",
    "phoneNumber": "1234567890"
}
```

#### Response

- **HTTP Status 200**: When successful, the response will include the consolidated contact details:

```json
{
    "primaryContactId": "60d0fe4f5311236168a109c0",
    "emails": ["user@example.com"],
    "phoneNumbers": ["1234567890"],
    "secondaryContactIds": ["60d0fe4f5311236168a109c1"]
}
```

- **HTTP Status 500**: If there is an error, you will receive:

```json
{
    "error": "Internal server error"
}
```

## Testing the Service

You can use tools like Postman or curl to test the API endpoint. 

### Example using curl:

```bash
curl -X POST http://localhost:3000/identify -H "Content-Type: application/json" -d '{"email": "user@example.com", "phoneNumber": "1234567890"}'
```

## Contributing

If you would like to contribute to this project, please fork the repository and create a pull request with your changes.
