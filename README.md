# 🛡️ School Vaccination Portal System

School Vaccination Portal is a full-stack MERN (MongoDB, Express, React, Node.js) web app designed to help school coordinators manage student vaccination data and reporting with ease.

---

## 📦 Features

- 👩‍🎓 Manage students: Add, edit, filter, bulk upload via CSV
- 💉 Schedule & manage vaccination drives per class
- ✅ Record vaccination per student (one per vaccine)
- 📊 Dashboard with analytics (total, vaccinated %, upcoming drives)
- 📤 Export reports as CSV, Excel, or PDF
- 🔐 JWT Authentication + secure API

---

## 📁 Project Structure
Student Vaccination POrtal/
├── backend/ → Express + MongoDB API
├── frontend/ → React single-page app


---

## 🚀 Setup Instructions

### 📌 Prerequisites

- Node.js v16+  
- MongoDB (local or Atlas URI)  
- npm / yarn

---

### 🔧 Backend Setup

cd backend
npm install
cp .env.example .env   # then edit .env with your Mongo URI and JWT secret
npm run dev            # or: nodemon server.js

PORT=5000
MONGO_URI=mongodb://localhost:27017/vaxportal
JWT_SECRET=supersecret

### FrontEnd Setup
cd frontend
npm install
cp .env.example .env   # optional: configure proxy
npm start



