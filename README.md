<div align="center">
  <img src="https://img.icons8.com/fluent/100/000000/instagram-new.png" alt="Loopin Logo" width="100"/>
  <h1>Loopin 📸</h1>
  <p>A full-stack, feature-rich social media application inspired by Instagram.</p>

  <div>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express.js" />
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101" alt="Socket.io" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  </div>
</div>

<br />

## 🌟 Overview

**Loopin** is a modern social networking platform built with the MERN stack (MongoDB, Express, React, Node.js). It seamlessly replicates core Instagram functionalities including photo sharing, real-time messaging, stories, and engaging user interactions, all wrapped in a stunning and fully responsive UI.

---

## ✨ Features

- **🔐 Authentication**: Secure user registration and login using JWT and bcrypt.
- **📷 Post Creation**: Upload photos with captions. Media storage handled via Cloudinary.
- **❤️ Interactions**: Like, comment, bookmark, and archive posts.
- **👥 Social Graph**: Follow, unfollow, and manage follow requests for private accounts.
- **💬 Real-Time Chat**: Live 1-on-1 messaging powered by Socket.io.
- **🎬 Stories**: Upload and view 24-hour vanishing stories.
- **🔔 Notifications**: Real-time alerts for likes, comments, and new followers.
- **📱 Responsive UI**: A beautiful, mobile-first design built with Tailwind CSS and Radix UI components.

---

## 🛠️ Tech Stack

### Frontend
* **React.js** (Vite) - Core UI library
* **Redux Toolkit & Persist** - State management
* **Tailwind CSS** - Utility-first styling
* **Shadcn/UI & Radix UI** - Accessible and customizable UI components
* **Socket.io-client** - Real-time websocket communication
* **Axios** - HTTP client

### Backend
* **Node.js & Express.js** - Server environment and framework
* **MongoDB & Mongoose** - NoSQL database and ODM
* **Socket.io** - WebSockets for live chat and notifications
* **Cloudinary** - Cloud storage for media assets (images/videos)
* **JWT (JSON Web Tokens)** - Stateless authentication
* **Multer** - Middleware for handling multipart/form-data

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [Git](https://git-scm.com/) installed on your machine. You will also need a MongoDB database and a Cloudinary account.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Faham-from-nowhere/Loopin.git
   cd "Loopin"
   ```

2. **Setup the Backend**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory with the following variables:
   ```env
   PORT=8000
   MONGO_URI=your_mongodb_connection_string
   SECRET_KEY=your_jwt_secret_key
   URL=http://localhost:5173
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```
   Run the backend server:
   ```bash
   npm run dev
   ```

3. **Setup the Frontend**
   ```bash
   cd ../frontend
   npm install
   ```
   Create a `.env` file in the `frontend` directory with the following variables:
   ```env
   VITE_API_URL=http://localhost:8000
   ```
   Run the frontend development server:
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to explore the app!

---

## 🌐 Deployment

Loopin is fully configured for cloud deployment.
* **Frontend:** Recommended to deploy on [Vercel](https://vercel.com/) or Netlify.
* **Backend:** Recommended to deploy on [Render](https://render.com/) or Heroku.

*Note: Ensure you update your `URL` environment variable on the backend to match your live frontend URL to prevent CORS errors.*

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/Faham-from-nowhere/Loopin/issues).

---

<div align="center">
  <p>Built with ❤️ by Faham</p>
</div>
