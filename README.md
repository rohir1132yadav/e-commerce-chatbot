# E-commerce Chatbot

A full-stack e-commerce chatbot application built with React, Node.js, and MongoDB.

## Features

- User authentication (login/register)
- Real-time chat interface
- Product search and browsing
- Responsive design
- Session management
- Product recommendations

## Tech Stack

### Frontend
- React (Vite)
- Material-UI
- Axios
- React Router

### Backend
- Node.js
- Express
- MongoDB
- JWT Authentication

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd e-commerce-chatbot
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
npm install
```

4. Create a `.env` file in the backend directory with the following variables:
```
MONGODB_URI=mongodb://localhost:27017/ecommerce-chatbot
JWT_SECRET=your-secret-key
PORT=5000
```

5. Start the backend server:
```bash
cd backend
npm start
```

6. Start the frontend development server:
```bash
cd frontend
npm run dev
```

7. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Register a new account or login with existing credentials
2. Start chatting with the bot to search for products
3. Use commands like:
   - "search [product name]"
   - "show categories"
   - "price range [min] to [max]"

## Project Structure

```
e-commerce-chatbot/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   └── App.jsx
│   └── package.json
├── backend/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user

### Chat
- POST /api/chat/session - Create new chat session
- POST /api/chat/message - Send message
- GET /api/chat/:userId - Get chat history

### Products
- GET /api/products - Get all products
- GET /api/products/search - Search products
- GET /api/products/:id - Get product by ID
- GET /api/products/category/:category - Get products by category

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 