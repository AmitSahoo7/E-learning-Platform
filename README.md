# 📚 MERN E-Learning Platform (e-LMS)

A full-stack **E-Learning Management System** built using the **MERN Stack (MongoDB, Express, React, Node.js)**. This platform empowers learners, instructors, and administrators to manage and deliver digital learning content seamlessly.

---

## 🚀 Live Demo

- **Backend:** [https://skillnest-backend.onrender.com/](https://skillnest-backend.onrender.com/)
- **Frontend:** [https://skill-nest-deploy.vercel.app/](https://skill-nest-deploy.vercel.app/)

**Instructions:**
1. First, open the backend link above (this will wake up the backend server).
2. Then, open the frontend link to access the full platform experience.
3. For the best experience, use a desktop browser.

---

## 🖼️ Homepage Preview

<img width="1919" height="1030" alt="Screenshot 2025-07-13 174441" src="https://github.com/user-attachments/assets/98b40274-9d52-4715-b8f4-f1827dce58c0" />

*SkillNest homepage: Modern, responsive design with clear calls to action for students and instructors.*

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

### 👩‍🎓 Student Features
- **Registration & Authentication**
  - Secure sign-up and login with email verification (OTP)
  - JWT-based session management
  - Profile management (update details, upload photo)
- **Course Discovery & Enrollment**
  - Browse and search for courses by category, difficulty, and instructor
  - View detailed course descriptions, prerequisites, learning outcomes, and instructor bios
  - Enroll in free or paid courses (integrated with Razorpay for secure payments)
- **Learning Experience**
  - Access enrolled courses and structured video lectures
  - Download course materials (PDFs, resources)
  - Track progress: see completed lectures, quizzes, and overall course completion
  - Set and monitor personalized study goals (daily, weekly, monthly)
  - Visual calendar for tracking learning activities and goals
  - View recommended courses based on learning history
- **Assessment & Certification**
  - Attempt quizzes and final assessments for each course
  - View quiz scores and assessment results
  - Download course completion certificates
- **Community & Engagement**
  - Participate in lecture-specific comment sections for discussions
  - Leave reviews and ratings for courses
  - View and contribute to course reviews
  - Access platform-wide leaderboard to compare progress and achievements
  - Join live events and webinars
- **Notifications & Announcements**
  - Receive real-time announcements and advanced notifications (smart dropdown, auto-close, scroll controls)
  - Mark announcements as read or cleared
  - Get notified about new courses, events, and deadlines
- **Support**
  - Access an AI-powered chatbot for general queries and platform guidance

### 👨‍🏫 Instructor Features
- **Registration & Authentication**
  - Register as an instructor (with verification)
  - Secure login and profile management
- **Course & Content Management**
  - Create, edit, and delete courses with rich metadata (title, description, category, price, duration, image, PDF, tagline, difficulty, prerequisites, learning outcomes, preview video)
  - Upload and organize video lectures and course materials
  - Add and manage quizzes and final assessments for their courses
  - View and manage enrolled students
- **Assessment & Analytics**
  - Create, edit, and review quizzes and final assessments
  - View student attempts and performance analytics
  - Track course engagement and completion rates
- **Community & Engagement**
  - Respond to student comments in lecture-specific discussion sections
  - View and respond to course reviews
  - Host and manage webinars and live events
- **Notifications**
  - Receive notifications about course enrollments, student activity, and platform announcements

### 🛠️ Admin Features
- **User & Role Management**
  - View, approve, reject, or delete users (students and instructors)
  - Assign or revoke instructor/admin roles
- **Course & Content Oversight**
  - Approve or reject course submissions
  - Edit or delete any course or lecture
  - Manage all course materials and resources
- **Platform Analytics & Dashboard**
  - Access comprehensive statistics: total courses, lectures, users, revenue, and system health
  - Monitor recent activity, feedback, and comments across the platform
  - View and manage all payments and revenue (integrated with Razorpay)
- **Assessment & Certification**
  - Oversee all quizzes and final assessments
  - Review student attempts and performance across the platform
  - Manage certificate templates and issuance
- **Webinar & Event Management**
  - Create, update, and delete webinars and live events
  - Monitor participation and engagement
- **Advanced Notifications & Announcements**
  - Create and broadcast announcements to all users
  - Advanced notification system with real-time updates, smart dropdown, and user read/clear tracking
- **System Tools**
  - Monitor system status and maintain private admin notes
  - Access feedback and comments for platform improvement

### 🔒 Platform-Wide Features
- **Secure Authentication:** JWT, bcrypt password hashing, and protected routes
- **File Upload Security:** Multer middleware for secure handling of videos, images, and PDFs
- **Modern Responsive UI:** Mobile-optimized, smooth transitions, custom scrollbars, and accessibility features
- **AI Chatbot:** Google Gemini-powered chatbot for user support
- **Loading States & Toast Notifications:** User-friendly feedback for all actions
- **Payment Integration:** Razorpay for secure course purchases
- **Leaderboard & Gamification:** Points, badges, and achievement tracking
- **Learning Analytics:** Visual dashboards for progress, streaks, and time spent

---

## 📂 Project Structure

```bash
.
├── frontend/               # React frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── context/
│       └── App.jsx
├── server/                 # Node backend
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
- Enhanced chatbot support (contextual, multi-language, voice)
- Discussion forum for students and instructors
- Live webinar hosting and real-time Q&A
- Advanced analytics and reporting
- More gamification features (badges, streaks, challenges)
- Integration with additional payment gateways
- Mobile app version
- And more...

---

## 🙌 Acknowledgements
Project by 
- Amit Kumar Sahoo
- Jagannath Patra
- Silva Simran
- Subham Kiran

---
