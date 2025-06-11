
# Real-Time Chat Application 🗨️

A full-stack **real-time chat application** built with a **microservices architecture**. It supports user authentication, friend management, real-time messaging, and secure session handling using refresh tokens.

---

## 🧱 Architecture Overview

### ➤ Microservices

1. **User Services**  
   Handles registration, login, authentication, and user profile management.  
   📦 Tech: Express.js, MySQL

2. **Friends Services**  
   Manages friend requests, accepts/rejects, and contact lists.  
   📦 Tech: Express.js, MySQL

3. **Message Services**  
   Supports real-time messaging and conversation tracking.  
   📦 Tech: Express.js, MongoDB, WebSockets (planned)

4. **Frontend**  
   A modern, responsive UI built using **Next.js**.  
   📦 Tech: Next.js 14, Tailwind CSS (assumed)

---

## 🗃️ Database Design

### 🧑 Users (MySQL)

Each user is stored in MySQL with a `UUID` primary key and the following fields:

- `uuid` (CHAR 36, PK)
- `username`
- `email`
- `bio`
- `password_hash`
- `auth_token`
- `created_at`, `updated_at`

### 🤝 Friend Requests (MySQL)

Friendship data is stored in a separate table referencing user UUIDs.

- `request_id` (PK)
- `sender_uuid`
- `receiver_uuid`
- `status` (`pending`, `accepted`, `rejected`)
- `created_at`, `updated_at`

### 💬 Messages & Conversations (MongoDB)

Each **message** document includes:

```js
{
  conversationId: ObjectId,
  sender: String (userUuid),
  receiver: String (userUuid),
  content: String,
  timestamp: Date
}
```

Each **conversation** document includes:

```js
{
  _id: ObjectId,
  participants: [String] // Array of user UUIDs
}
```

---

## 🔐 Refresh Token Schema (MongoDB)

Stored in the `refresh_tokens` collection:

```js
const refreshTokenSchema = new mongoose.Schema({
  userUuid: { type: String, required: true, ref: 'User' },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  revokedAt: { type: Date, default: null },
  replacedByToken: { type: String, default: null }
});

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

---

## 📁 Project Structure

```
real-time-chat/
├── chat-shared-models/           # Shared MongoDB models
├── friends-related-services/     # Friend request microservice
├── message-related-services/     # Messaging and conversation microservice
├── user-related-services/        # User auth and profile microservice
├── frontend/                     # Next.js frontend
├── list_of_all_services          # Index or notes
├── reference.txt                 # Additional context or info
└── ContextForGPT                 # ChatGPT project context
```

---

## ⚙️ Development Workflow

1. **Design APIs**
2. **Build backend logic**
3. **Connect with frontend**
4. **Test end-to-end**

---

## 🚀 Features

- ✅ JWT-based Auth with Refresh Tokens
- ✅ Microservices with DB separation
- ✅ Modular shared MongoDB models
- ✅ Scalable and maintainable architecture
- ✅ Ready for WebSocket integration (real-time updates)

---

## 🛠️ Tech Stack

| Layer         | Technology                      |
|---------------|----------------------------------|
| Frontend      | Next.js, Tailwind CSS           |
| Backend       | Express.js (per service)        |
| Auth Database | MySQL (user + friends)          |
| Chat Storage  | MongoDB (conversations + messages) |
| Tokens        | JWT, Refresh Tokens in MongoDB  |

---

## 📌 Notes

- Each microservice uses its own `connectDB.js` to manage DB access.
- Shared MongoDB models are bundled as a private NPM module.
- Frontend is in a separate folder for clean separation.

---

## 📦 Installation

```bash
# Clone repo
git clone https://github.com/your-username/real-time-chat.git
cd real-time-chat

# Install dependencies for each service
cd chat-shared-models && npm install
cd ../user-related-services && npm install
cd ../friends-related-services && npm install
cd ../message-related-services && npm install
cd ../frontend && npm install
```

---

## 🧪 Running Locally

You can use `concurrently`, Docker, or start each microservice individually.

Example:

```bash
# Start user service
cd user-related-services && nodemon server.js

# Start friend service
cd friends-related-services && nodemon server.js

# Start message service
cd message-related-services && nodemon server.js

# Start frontend
cd frontend && npm run dev
```

---

## ✅ TODO / Roadmap

- [ ] Add WebSocket support for real-time updates
- [ ] Implement user presence/typing indicators
- [ ] Add file/image attachments to messages
- [ ] Create CI/CD pipelines
- [ ] Dockerize services

---

## 👨‍💻 Author

**Arshal Agarwal**

Feel free to fork, clone, or reach out if you want to collaborate!

---

## 📄 License

This project is licensed under the MIT License.
