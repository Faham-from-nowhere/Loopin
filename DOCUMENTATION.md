# Loopin - Extensive Documentation

Welcome to the comprehensive documentation for **Loopin**, a full-stack social media application. This document covers the technical implementation details of each feature, as well as the challenges faced during development and deployment, and how they were resolved.

---

## 🌟 Feature Breakdown

### 1. Authentication & Authorization
* **Mechanism:** JWT (JSON Web Tokens) stored in HTTP-only cookies.
* **Flow:** Users register with an email, username, and password. Passwords are encrypted using `bcryptjs` before being stored in MongoDB. Upon successful login, the server generates a JWT and sends it as a secure cookie (`sameSite: 'none'`, `secure: true`) to the client.
* **Security:** Using HTTP-only cookies prevents XSS attacks from easily accessing the token.

### 2. Post Creation & Media Management
* **Mechanism:** `multer` for multipart/form-data parsing, `cloudinary` for cloud media storage.
* **Flow:** When a user uploads a post, the image is parsed by Multer and converted into a Data URI. This URI is sent to Cloudinary's API, which securely stores the image and returns a permanent URL. This URL is then saved in the MongoDB Post document.

### 3. Interactions (Likes, Comments, Bookmarks)
* **Mechanism:** MongoDB relational references and array updates.
* **Flow:** 
  * **Likes:** The `likes` array inside a Post document stores ObjectIds of users who liked it. Toggling a like adds or pulls the ID from the array.
  * **Comments:** Stored as separate Documents with a reference to the author and the parent post. The Post document maintains an array of Comment ObjectIds.
  * **Bookmarks:** The User document maintains a `bookmarks` array containing ObjectIds of saved posts.

### 4. Social Graph (Follow & Unfollow)
* **Mechanism:** Graph-like relationships stored in User documents.
* **Flow:** Every User document has `followers` and `following` arrays. When User A follows User B, User A's ID is pushed to User B's `followers` array, and User B's ID is pushed to User A's `following` array. For private accounts, IDs are instead pushed to a `followRequests` array, awaiting approval.

### 5. Real-Time Chat (Socket.io)
* **Mechanism:** WebSockets via `socket.io`.
* **Flow:** Upon login, the client establishes a persistent WebSocket connection. The backend maps the User's ID to their active Socket ID. When a message is sent via the REST API, the server saves it to the database and immediately emits a Socket event to the receiver's specific Socket ID, enabling instant chat without refreshing.

### 6. Stories
* **Mechanism:** 24-hour expiration logic with Cloudinary media.
* **Flow:** Users can upload stories which are saved to the database. The frontend groups stories by user. While the stories don't automatically delete from the DB natively in this version, the frontend filters out any stories older than 24 hours based on their `createdAt` timestamp.

### 7. Notifications
* **Mechanism:** Real-time push via Socket.io combined with persistent DB storage.
* **Flow:** Whenever an action occurs (e.g., someone likes a post), the backend creates a Notification document and saves it. Simultaneously, it uses `socket.io` to emit a live event to the specific user's room, updating their UI instantly.

### 8. Offline Mode & Queue Syncing
* **Mechanism:** Network event listeners and `localStorage` caching.
* **Flow:** A custom `useOfflineQueue` hook actively monitors the `navigator.onLine` status. If the user loses internet connection while attempting to create a post, the post details (including image blobs converted to local URLs) are stored in an array within `localStorage`. Upon reconnecting to the internet, a listener detects the `online` event and automatically sequentially uploads every pending post in the queue.

### 9. Synchronized Video Watch Party
* **Mechanism:** Custom `socket.io` events mapping playback states across clients.
* **Flow:** Users in the same chat room can watch shared videos synchronously. The custom `<VideoPlayer>` component emits `videoAction` events (play, pause, current timestamp) to the server whenever a user interacts with the video. The server relays these actions to all other users in the chat room, forcing their local video players to jump to the matching timestamp and mirror the play/pause state.

---

## 🛑 Problems Faced & Solutions

### Problem 1: Broken Vercel Builds Due to Local `.tgz` Files
* **Issue:** During development, several packages (like `@babel/core`, `zod-to-json-schema`, etc.) were accidentally installed from local `.tgz` files rather than the official npm registry. Because these files were ignored via `.gitignore`, Vercel crashed during the `npm install` phase with an `ENOENT: no such file or directory` error.
* **Solution:** We aggressively uninstalled all local dependencies, deleted `node_modules` and the `package-lock.json` file, and ran a fresh `npm install` to force npm to pull everything directly from the internet. Pushing the clean `package-lock.json` completely resolved the Vercel build failures.

### Problem 2: Hardcoded Localhost URLs in Production
* **Issue:** The frontend codebase had dozens of instances where `http://localhost:8000` was hardcoded into Axios and Socket.io requests. In production on Vercel, the app was still trying to talk to the local machine instead of the live Render backend.
* **Solution:** We created a Node.js script to automatically walk through the React components and replace all hardcoded localhost strings with dynamic environment variables `` `\${import.meta.env.VITE_API_URL || 'http://localhost:8000'}` ``. 

### Problem 3: Template Literal Escaping Bug
* **Issue:** While automating the URL replacements, the script accidentally "escaped" the template literal (e.g., `\${import...}`). This caused JavaScript to treat it as a literal string rather than evaluating the environment variable, leading to a massive wave of 404 errors as the frontend tried to literally fetch `http://.../%24%7Bimport...`.
* **Solution:** A secondary clean-up script was written to find and remove the erroneous backslash (`\`) across all 20+ affected frontend components.

### Problem 4: Cross-Domain Cookie Blocking (CORS & ITP)
* **Issue:** The backend was initially configured to set cookies with `sameSite: 'strict'`. Since the Vercel frontend and Render backend were on different domains, modern browsers blocked the authentication cookie, resulting in `401 Unauthorized` errors after a successful login. 
* **Solution Part A:** We updated the backend to issue cookies with `sameSite: 'none'` and `secure: true`, allowing cross-domain cookies.
* **Solution Part B (Apple Devices / Mobile ITP):** Apple devices (iOS Safari, Mac Safari) and some Android browsers enforce Intelligent Tracking Prevention (ITP), which completely blocks third-party cookies regardless of the `sameSite` setting. To fix this globally, we set up a **Reverse Proxy** using `vercel.json`. By telling Vercel to proxy `/api` requests to Render, the frontend only communicated with its own domain, tricking the browser into treating the authentication cookie as a safe, first-party cookie.

---
*Documentation compiled upon successful deployment.*
