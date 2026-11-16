# RecipeAI – Smart AI Recipe Generator & Food Health Analyzer

> **Final-Year B.Tech Computer Science Capstone Project**  
> A full-stack MERN application powered by Google Gemini AI, featuring smart recipe generation, nutritional intelligence, weekly meal planning, and interactive grocery lists.

---

## 🌟 Project Overview

**RecipeAI** is a food-tech platform engineered to eliminate domestic food waste and simplify meal preparation. Users can input any combination of ingredients currently available in their kitchen, select dietary preferences (Vegetarian, Vegan, Non-Vegetarian) and time constraints, and receive 3 AI-crafted recipes complete with step-by-step instructions and nutritional estimates.

The application also features an **AI Nutrition & Food Health Analyzer** that calculates a calibrated **Health Score (0–100)**, identifies positive aspects and areas to improve, provides healthier food substitutions, allows side-by-side food comparisons, and logs meals into a daily food diary tracked against standard RDA targets.

---

## 🚀 Key Features

### 1. 🍳 AI Recipe Generator (Flagship Feature)
- **Ingredient Matching:** Enter loose pantry items with instant tag inputs and quick-add pills.
- **Custom Culinary Filters:** Filter by meal type (Breakfast, Lunch, Dinner, Snacks, Desserts), dietary preferences, maximum cooking time (slider), and difficulty.
- **Gemini API Integration:** Backend securely calls Google Gemini (`gemini-2.5-flash` / `gemini-1.5-flash`) via an authenticated proxy endpoint.
- **Structured Output:** Yields 3 structured recipe options complete with quantities, instructions, servings, cook time, and macro estimates.
- **Resilient Fallback Mode:** Transparent demo fallback with sample recipes if an API key is not yet configured.

### 2. 🥗 Explore & Multi-Filter Catalog
- Pre-populated with 9 chef-tested dishes with food photography.
- Real-time text search by recipe name or ingredients.
- Filter by category, cooking time, difficulty, and diet.

### 3. 📖 Interactive Recipe Details
- High-resolution hero imagery, preparation & cook times, servings, and difficulty.
- Interactive checklist to check off ingredients during meal prep.
- Step-by-step instructions with completion tracking.
- One-click actions: "Add to Favourites", "Add to Grocery List", "Add to Weekly Meal Plan".

### 4. 📊 AI Nutrition & Food Health Analyzer (Module)
- **Comprehensive Macronutrient Breakdown:** Total calories, protein, carbs, fat, saturated fat, sugar, fiber, and sodium.
- **Calibrated Health Score (0–100):** Evaluates nutrient density, rewarding fiber and lean protein while advising moderation for excessive saturated fat, sugar, or sodium.
- **Healthier Food Adjustments:** Recommends ingredient substitutions and compares the original dish against an optimized healthier version.
- **AI Food Image Analysis:** Supports image uploads with Gemini Vision for automated food recognition.
- **Side-by-Side Food Comparison:** Compares two dishes simultaneously and computes exact nutrient deltas.
- **Daily Food Diary & RDA Progress:** Log daily meals and monitor intake against standard Recommended Daily Allowances.

### 5. 📅 Weekly Meal Planner
- 7-day calendar (Monday through Sunday) with 3 slots per day (Breakfast, Lunch, Dinner).
- Modal to assign recipes to specific days.
- Real-time removal and updates saved to the database.

### 6. 🛒 Smart Grocery Shopping List
- Automatically imports ingredients from recipes or accepts custom items.
- Real-time progress bar tracking purchased items.
- Item categorization (Produce, Dairy, Pantry, etc.) and completed item cleanup.

### 7. 🔐 User Authentication & Dual Database Architecture
- JWT-based authentication with bcryptjs password hashing.
- **Dual Data Engine:** Connects to MongoDB / MongoDB Atlas when configured, with an automatic pure JavaScript in-memory fallback store so the project runs out-of-the-box on any machine without local database setup!

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | React 18 with Vite | Modern single-page application (JSX) |
| **Styling** | Vanilla CSS3 | Custom design system (Cream `#faf8f5`, Forest Green `#153e2e`, Warm Orange `#ea580c`) |
| **Routing** | React Router DOM v6 | Client-side routing with clean navigation |
| **Icons** | Lucide React | Lightweight SVG icons |
| **HTTP Client** | Axios | Configured with JWT interceptors |
| **Backend** | Node.js & Express.js | RESTful modular API architecture |
| **Database** | MongoDB & Mongoose | Schemas for Users, Recipes, MealPlans, ShoppingLists, NutritionLogs |
| **AI Engine** | Google Gemini API | Server-side prompt engineering with vision support |
| **Security** | JWT + bcryptjs | Protected routes, password hashing, and CORS |

---

## 📂 Project Structure

```
recipeAi/
├── backend/
│   ├── config/
│   │   ├── db.js              # Resilient MongoDB connection with memory fallback
│   │   └── memoryDb.js        # Pure JavaScript in-memory data store
│   ├── controllers/
│   │   ├── authController.js  # Registration, login, profile
│   │   ├── recipeController.js# Recipe CRUD and filtering
│   │   ├── aiController.js    # Gemini recipe generation
│   │   ├── favouriteController.js
│   │   ├── mealPlanController.js
│   │   ├── shoppingListController.js
│   │   └── nutritionController.js # AI Nutrition & comparison
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT protection & optional auth
│   │   └── errorMiddleware.js # Centralized 404 & error handlers
│   ├── models/
│   │   ├── User.js
│   │   ├── Recipe.js
│   │   ├── MealPlan.js
│   │   ├── ShoppingList.js
│   │   └── NutritionLog.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── recipeRoutes.js
│   │   ├── aiRoutes.js
│   │   ├── favouriteRoutes.js
│   │   ├── mealPlanRoutes.js
│   │   ├── shoppingListRoutes.js
│   │   └── nutritionRoutes.js
│   ├── utils/
│   │   ├── geminiClient.js    # Gemini API wrapper with fallback
│   │   ├── nutritionCalculator.js # Health score & RDA calculations
│   │   └── seedData.js        # Pre-crafted sample recipes
│   ├── server.js              # Express entry point
│   ├── package.json
│   ├── .env.example
│   └── .env
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Navbar.jsx / Navbar.css
│   │   │   ├── Footer.jsx / Footer.css
│   │   │   ├── RecipeCard.jsx / RecipeCard.css
│   │   │   ├── SkeletonLoader.jsx / SkeletonLoader.css
│   │   │   └── Toast.jsx / Toast.css
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx / Home.css
│   │   │   ├── Explore.jsx / Explore.css
│   │   │   ├── Generator.jsx / Generator.css
│   │   │   ├── RecipeDetails.jsx / RecipeDetails.css
│   │   │   ├── Favourites.jsx / Favourites.css
│   │   │   ├── MealPlanner.jsx / MealPlanner.css
│   │   │   ├── ShoppingList.jsx / ShoppingList.css
│   │   │   ├── NutritionAnalyzer.jsx / NutritionAnalyzer.css
│   │   │   ├── Login.jsx / Register.jsx / Auth.css
│   │   ├── services/
│   │   │   └── api.js         # Axios instance with auth interceptors
│   │   ├── App.jsx / App.css
│   │   ├── main.jsx
│   │   └── index.css          # Global design system
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## ⚡ Quickstart & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- *(Optional)* MongoDB locally or a MongoDB Atlas URI (otherwise In-Memory mode runs automatically).

### 1. Clone or Navigate to Directory
```bash
cd "C:\Users\Vanshika Sharma\Desktop\recipeAi"
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Configure `backend/.env` (pre-created with defaults):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/recipeai
JWT_SECRET=supersecretjwtkey_recipeai_development_2026
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

Start the backend server:
```bash
npm start
# or for auto-reloading dev mode:
npm run dev
```
> Server runs on `http://localhost:5000`.

### 3. Frontend Setup
Open a second terminal window:
```bash
cd "C:\Users\Vanshika Sharma\Desktop\recipeAi\frontend"
npm install
npm run dev
```
> Frontend dev server runs on `http://localhost:5173`.

---

## 📡 API Reference

| Resource | Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| **System** | `GET` | `/api/health` | Service health check | No |
| **Auth** | `POST` | `/api/auth/register` | Register new user account | No |
| **Auth** | `POST` | `/api/auth/login` | Login and receive JWT | No |
| **Auth** | `GET` | `/api/auth/me` | Fetch logged-in user profile | Yes |
| **Recipes** | `GET` | `/api/recipes` | Search & filter recipes | No |
| **Recipes** | `GET` | `/api/recipes/:id` | Get single recipe by ID | No |
| **Recipes** | `POST` | `/api/recipes` | Save new or AI-generated recipe | Yes |
| **AI** | `POST` | `/api/ai/generate` | Generate 3 recipes with Gemini AI | No |
| **Nutrition** | `POST` | `/api/nutrition/analyze`| Comprehensive nutrition & health score | No |
| **Nutrition** | `POST` | `/api/nutrition/compare`| Compare two dishes side-by-side | No |
| **Nutrition** | `GET` | `/api/nutrition/logs` | Fetch user's food diary entries | Yes |
| **Nutrition** | `POST` | `/api/nutrition/logs` | Log meal entry to food diary | Yes |
| **Nutrition** | `DELETE`| `/api/nutrition/logs/:id`| Remove food diary entry | Yes |
| **Nutrition** | `GET` | `/api/nutrition/summary`| Fetch daily totals and RDA progress | Yes |
| **Favourites**| `GET` | `/api/favourites` | Fetch saved favourite recipes | Yes |
| **Favourites**| `POST` | `/api/favourites/:id`| Add recipe to favourites | Yes |
| **Favourites**| `DELETE`| `/api/favourites/:id`| Remove recipe from favourites | Yes |
| **Meal Plan** | `GET` | `/api/meal-plans` | Fetch weekly planned meals | Yes |
| **Meal Plan** | `POST` | `/api/meal-plans` | Assign recipe to day and meal type | Yes |
| **Meal Plan** | `DELETE`| `/api/meal-plans/:id`| Remove meal from plan | Yes |
| **Shopping** | `GET` | `/api/shopping-list` | Fetch grocery items | Yes |
| **Shopping** | `POST` | `/api/shopping-list` | Add single grocery item | Yes |
| **Shopping** | `POST` | `/api/shopping-list/bulk`| Add all ingredients from a recipe | Yes |
| **Shopping** | `PUT` | `/api/shopping-list/:id`| Toggle item purchased status | Yes |
| **Shopping** | `DELETE`| `/api/shopping-list/:id`| Delete item from list | Yes |
| **Shopping** | `DELETE`| `/api/shopping-list` | Clear completed items | Yes |

---

## 🎓 Viva & Technical Interview Guide

- **Why Vite instead of Create-React-App?** Vite provides instant Hot Module Replacement (HMR) powered by native ES modules and Rollup for efficient bundling.
- **How is the Gemini API secured?** The API key is stored strictly on the server in `backend/.env`. The frontend calls the backend proxy route `/api/ai/generate`, ensuring zero key exposure in browser client bundles.
- **How does the dual-engine data layer work?** The Mongoose models are proxied to an in-memory data store when local MongoDB is unreachable. This ensures examiners can run `npm start` immediately on any evaluation machine without encountering connection timeout crashes.
- **How is the Health Score calculated?** The algorithm evaluates macronutrient ratios and nutrient density, adding positive weights for dietary fiber and lean protein while flagging excess saturated fat, refined sugar, and high sodium.

---

## 📄 License
This project is developed for educational purposes under the ISC License.

