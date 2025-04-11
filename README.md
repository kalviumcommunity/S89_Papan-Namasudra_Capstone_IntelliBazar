# 🛒 AI-Powered Shopping Website(IntelliBazar)

## 📌 Project Overview

This project is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) application that enhances the online shopping experience through AI-powered features. It integrates personalized product recommendations, a smart chatbot, image-based search, dynamic discounting, fake review detection, and voice search.

The aim is to improve user engagement, increase conversion rates, and boost customer satisfaction while optimizing backend operations through AI.

---

## 🚀 Key Features & Implementation

### 1. 🧠 AI-Powered Personalized Product Recommendations

- **Description:** Suggests relevant products to users based on their behavior, purchase history, and preferences.
- **Implementation:**
  - Capture user behavior (clicks, views, purchases) on the frontend.
  - Store user activity in MongoDB.
  - Use a recommendation system model trained using TensorFlow.js or a backend service like Python + FastAPI with TensorFlow Recommenders.
  - Serve recommendations via a REST API.
- **Tech Stack:** TensorFlow.js / Python (TensorFlow Recommenders), Node.js + Express.js, MongoDB, React.js

---

### 2. 🤖 AI Chatbot for Customer Support

- **Description:** An AI-based chatbot assists users in finding products, answering FAQs, and tracking orders.
- **Implementation:**
  - Integrate OpenAI GPT API.
  - Chatbot UI built with React.js.
  - Backend handles user queries and routes them to AI services.
- **Tech Stack:** OpenAI API, React.js, Node.js + Express.js, MongoDB

---

### 3. 🖼️ AI Image-Based Product Search

- **Description:** Users can upload images to search for visually similar products in the catalog.
- **Implementation:**
  - Use TensorFlow.js or a Flask microservice with Google Vision API for feature extraction.
  - Store product image vectors in MongoDB or a vector database (e.g., Pinecone for advanced scale).
  - Match uploaded image vectors using Cosine Similarity.
- **Tech Stack:** Google Vision API / TensorFlow.js, React.js, Node.js + Express.js, MongoDB

---

### 4. 🎯 AI-Based Smart Discounts & Offers

- **Description:** Applies dynamic, personalized discounts based on user loyalty, activity, and purchase patterns.
- **Implementation:**
  - Track user activity logs in MongoDB.
  - Train a logistic regression or decision tree model using Scikit-learn.
  - Expose discount eligibility logic via API.
- **Tech Stack:** Python (Scikit-learn), FastAPI, Node.js + Express.js, MongoDB

---

### 5. 🔊 Voice-Based Product Search

- **Description:** Users can speak their queries to search for products.
- **Implementation:**
  - Capture voice input via browser’s Web Speech API or use Whisper API.
  - Convert audio to text.
  - Perform text-based search against product catalog.
- **Tech Stack:** Google Speech API / Whisper API, React.js, Node.js + Express.js, MongoDB

---

## 🧱 Tech Stack

| Layer     | Technology                                       |
|-----------|--------------------------------------------------|
| Frontend  | React.js, Tailwind CSS                           |
| Backend   | Node.js, Express.js, FastAPI (ML Microservices)  |
| Database  | MongoDB (via MongoDB Atlas)                      |
| AI/ML     | TensorFlow.js, Scikit-learn, OpenAI API          |
| Hosting   | Vercel (Frontend), Render (Backend), MongoDB Atlas |

---

## 🚀 Deployment Strategy

- **Frontend** hosted on **Vercel** for seamless CI/CD.
- **Backend API** deployed on **Render**.
- **Database** hosted on **MongoDB Atlas**.
- **ML models** served via **FastAPI microservices (Python)** or pre-trained API integrations.

---

## 🔮 Future Enhancements

- Augmented Reality Try-On for fashion and accessories.
- AI Dynamic Pricing based on real-time trends and competitor data.
- Blockchain for Transactions to ensure transparency and prevent fraud.
- Multilingual Chatbot with voice and text interaction.

---

## ✅ Conclusion

This MERN-based AI Shopping Website project showcases how modern AI techniques can be combined with scalable web development to create a personalized, engaging, and secure e-commerce experience. From smart recommendations to intelligent search and dynamic pricing, this project brings cutting-edge innovation to online shopping.

---

## 📅 Project Timeline (30-Day Development Plan)

### 🔧 Week 1: Project Setup(Days 1–7)

| Day   | Tasks |
|-------|-------|
| Day 1 | ✅ Project planning, GitHub repo setup, tech stack finalization. <br> ✅ Install Node.js, MongoDB, Postman, and set up base folder structure. |
| Day 2 | ✅ Backend setup with Express.js: Connect MongoDB Atlas, setup user authentication (JWT). |
| Day 3 | ✅ Create Product and Order schemas. <br> ✅ Build product APIs (get all, get by ID, search). |
| Day 4 | ✅ Frontend setup with React + Tailwind CSS. <br> ✅ Create Home, Product List, Product Details pages. |
| Day 5 | ✅ Implement user auth UI (register/login) with token storage. |
| Day 6 | ✅ Add "Add to Cart", "View Cart", and "Checkout" features (frontend + backend). |
| Day 7 | ✅ Test all core features. <br> ✅ Deploy initial version (Frontend to Vercel, Backend to Render). |

---

### 🤖 Week 2: Chatbot & Voice Search (Days 8–14)

| Day   | Tasks |
|-------|-------|
| Day 8 | ✅ Integrate OpenAI GPT API or Dialogflow for chatbot backend. |
| Day 9 | ✅ Build chatbot frontend (React floating chatbot component). |
| Day 10| ✅ Connect chatbot to backend API. Add support for product search, FAQs, order status. |
| Day 11| ✅ Implement Voice Search UI using Web Speech API. |
| Day 12| ✅ Connect voice input to search endpoint – show matching results. |
| Day 13| ✅ Test chatbot & voice search features together. |
| Day 14| ✅ Bug fixing & improve chatbot conversation flow (intents, fallbacks). |

---

### 🧠 Week 3: Recommendations & Image-Based Search (Days 15–21)

| Day   | Tasks |
|-------|-------|
| Day 15| ✅ Track user behavior (clicks, views, purchases) on frontend. |
| Day 16| ✅ Store behavior data in MongoDB via Express routes. |
| Day 17| ✅ Build recommendation logic (TensorFlow.js / FastAPI + Recommenders). |
| Day 18| ✅ Add "Recommended Products" section on homepage/product page. |
| Day 19| ✅ Create image upload UI in React and connect to backend. |
| Day 20| ✅ Use Google Vision API / OpenCV to extract image features and match products. |
| Day 21| ✅ Test end-to-end flow: upload → match → display results. |

---

### 🎯 Week 4: Smart Discounts, UI Polish, Final Deployment (Days 22–30)

| Day   | Tasks |
|-------|-------|
| Day 22| ✅ Track user engagement stats (time spent, purchases, cart activity). |
| Day 23| ✅ Train ML model (Scikit-learn) for discount prediction. |
| Day 24| ✅ Expose FastAPI route to check discount eligibility. |
| Day 25| ✅ Show smart discounts (banners, coupons) on UI. |
| Day 26| ✅ Add fake review detection logic (optional bonus). |
| Day 27| ✅ Polish UI: animations, responsiveness, toast alerts. |
| Day 28| ✅ Final tweaks: loading states, error handling, form validations. |
| Day 29| ✅ Final testing (frontend/backend/AI). <br> ✅ Setup `.env`, update README, write docs. |
| Day 30| ✅ Final deployment & demo-ready build. <br> ✅ Record demo video or screenshots. |

---