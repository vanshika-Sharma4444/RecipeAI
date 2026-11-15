# 🍽️ RecipeAI – AI-Powered Recipe Platform

RecipeAI is a full-stack web application designed to make cooking easier, smarter, and more organized. It allows users to explore recipes, generate personalized recipes using AI, analyze nutritional information, plan meals, and manage shopping lists — all in one place.

## ✨ Features

- **AI Recipe Generator:** Generate personalized recipes with AI assistance.
- **Explore Recipes:** Browse and discover different recipes.
- **User Authentication:** Register and log in to your account.
- **Favourites:** Save and manage your favourite recipes.
- **Meal Planner:** Organize your meals and plan your food schedule.
- **Shopping List:** Manage ingredients needed for your recipes.
- **Nutrition Analyzer:** Analyze nutritional information of food.
- **Recipe Details:** View recipe information and cooking instructions.

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- JavaScript
- HTML5
- CSS3
- Axios
- React Router

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Gemini API

## 📁 Project Structure

```text
RecipeAI/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
│
├── .gitignore
└── README.md
```

## 🚀 Getting Started

Follow these steps to run RecipeAI locally.

### 1. Clone the Repository

```bash
git clone https://github.com/vanshika-Sharma4444/RecipeAI.git
cd RecipeAI
```

### 2. Set Up the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder using `.env.example` as a reference.

Add your environment variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=development
```

Start the backend server:

```bash
npm run dev
```

### 3. Set Up the Frontend

Open a new terminal from the project root:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed in your terminal to access the application.

## 🔐 Environment Variables

Keep your API keys, database connection string, and JWT secret private. Never upload your actual `.env` file to GitHub.

## 🎯 Project Objective

The main objective of RecipeAI is to combine recipe discovery, AI-powered assistance, and meal organization into one convenient platform. It aims to provide users with a simple and interactive cooking experience.

## 👩‍💻 Developer

**Vanshika**  
B.Tech – Computer Science and Engineering

## 📌 Future Improvements

- Add more personalized recipe recommendations.
- Improve AI-generated recipe suggestions.
- Enhance the user experience with additional features.

---

⭐ If you find this project useful, consider giving it a star!
