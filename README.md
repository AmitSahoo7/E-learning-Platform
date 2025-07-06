# 📚 MERN E-Learning Platform (e-LMS)

A full-stack **E-Learning Management System** built using the **MERN Stack (MongoDB, Express, React, Node.js)**. This is designed to help learners, instructors, and administrators manage and deliver digital learning content seamlessly.

---

## 🔧 Tech Stack

### 💻 Frontend:
- **React JS**
- **Redux Toolkit** for state management
- **React Router DOM** for navigation
- **Tailwind CSS** for styling
- **Axios** for API requests

### 🌐 Backend:
- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose**
- **JWT (JSON Web Token)** for authentication
- **Multer** for file uploads
- **bcrypt.js** for password hashing

---

## ✨ Features

### ✅ Authentication & Authorization
- JWT-based login & signup for **Students**, **Instructors**, and **Admins**
- Role-based access control (RBAC)

### 📚 Course Management
- Create, update, and delete courses
- Upload video lectures (via `multer`)
- Organize lectures by chapters/modules

### 🧑‍🎓 Student Features
- Enroll in courses
- Track progress
- Watch video lectures
- View course content and syllabus

### 👨‍🏫 Instructor Features
- Create and manage their own courses
- Upload and organize lectures
- View enrolled students

### 🛠️ Admin Features
- View all users & courses
- Approve or reject course submissions
- Delete or ban users

### 💳 Payment Integration (Future Scope)
- Razorpay / Stripe (can be added for paid courses)

### Announcement System
- **Smart Dropdown**: Notification dropdown with scroll functionality when content exceeds half page height
- **Auto-Close**: Automatically closes when clicking outside the announcement area
- **Scroll Controls**: Up/down scroll buttons appear when content is scrollable
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Real-time Updates**: Polls for new announcements every 10 seconds

### Key Components
- **Header Component**: Main navigation with integrated announcement system
- **Scroll Management**: Dynamic scroll button visibility based on content overflow
- **Click Outside Detection**: Uses event listeners to detect clicks outside dropdown
- **Mobile Optimization**: Adjusted heights and button sizes for mobile devices

## Technical Implementation

### Announcement Dropdown Features
1. **Height Limitation**: Dropdown is limited to 50% of viewport height (60% on mobile)
2. **Scroll Detection**: Automatically detects when content exceeds available space
3. **Scroll Buttons**: Chevron up/down buttons appear when scrolling is needed
4. **Auto-Close**: Closes dropdown when clicking anywhere outside the notification area
5. **Smooth Scrolling**: Custom scroll behavior with 100px increments

### CSS Features
- Custom scrollbar styling with brand colors
- Responsive design with mobile-specific adjustments
- Smooth transitions and hover effects
- Backdrop blur effects for modern UI

---

## 📂 Project Structure

```bash
.
├── client/               # React frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── redux/
│       └── App.js
├── server/               # Node backend
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   └── index.js
├── .env
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js & npm installed
- MongoDB running locally or via Atlas

---

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/AmitSahoo7/E-learning-Platform.git
cd E-learning-Platform
```

---

### 2️⃣ Setup Backend

```bash
cd server
npm install
```

- Create a `.env` file in the `server/` directory with the following variables:

```env
PORT=5000
MONGO_URL=mongodb://localhost:27017/elearning
JWT_SECRET=your_jwt_secret
```

- Run the server:

```bash
npm run dev
```

---

### 3️⃣ Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🛠️ Tools Used
- VS Code
- Postman (for testing APIs)
- MongoDB Compass (for database management)

---

## 🧪 Future Improvements
- Add quizzes and assignments
- Add Stripe/Razorpay for paid courses
- Chat/Discussion forum for students and instructors
- Real-time progress tracking
- Notifications and email support

---

## 🙌 Acknowledgements
Project by 
- Amit Kumar Sahoo
- Jagannath Patra
- Silva Simran
- Subham kiran

---
