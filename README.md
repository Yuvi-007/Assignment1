# Project Management API

A RESTful backend API for managing construction projects, teams, and Daily Progress Reports (DPRs) — built with Node.js, Express, and JWT-based authentication.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

---

## ✨ Features

- User registration and login with JWT authentication
- Role-based access control (Admin / Manager / User)
- Full CRUD operations for construction projects
- Daily Progress Report (DPR) creation and retrieval per project
- Paginated project listing with status filtering

---

## 🛠️ Tech Stack

| Layer        | Technology              |
|--------------|-------------------------|
| Runtime      | Node.js                 |
| Framework    | Express.js              |
| Database     | MongoDB (Mongoose ODM)  |
| Auth         | JSON Web Tokens (JWT)   |
| Password     | bcryptjs                |
| Cookie Auth  | cookie-parser           |
| Dev Server   | nodemon                 |
| Env Config   | dotenv                  |

---

## ✅ Prerequisites

Make sure the following are installed on your system before proceeding:

- [Node.js](https://nodejs.org/) — v18.x or higher
- [npm](https://www.npmjs.com/) — v9.x or higher
- [Git](https://git-scm.com/)
- [MongoDB](https://www.mongodb.com/try/download/community) — Community Edition (local), **or** a free [MongoDB Atlas](https://www.mongodb.com/atlas) cloud cluster
- A tool like [Postman](https://www.postman.com/) or [Thunder Client](https://www.thunderclient.com/) for API testing (optional)

---

## 🚀 Getting Started

Follow these steps in order to clone and run the project locally.

### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

> Replace `your-username/your-repo-name` with the actual GitHub repository path.

---

### Step 2 — Install Dependencies

```bash
npm install
```

This will install all required packages listed in `package.json`.

---

### Step 3 — Set Up MongoDB

You have two options — choose one:

**Option A: Local MongoDB**

1. Make sure MongoDB is installed and running on your machine:

```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB service (Linux/macOS)
sudo systemctl start mongod
# or
brew services start mongodb-community
```

2. Your connection string in `.env` will look like:

```
MONGO_URI=mongodb://localhost:27017/construction_db
```

**Option B: MongoDB Atlas (Cloud — Recommended)**

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free account.
2. Create a new **cluster** (free tier is fine).
3. Under **Database Access**, create a database user with a username and password.
4. Under **Network Access**, add your IP address (or allow all: `0.0.0.0/0` for development).
5. Click **Connect → Drivers**, copy the connection string, and paste it into your `.env`:

```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/construction_db?retryWrites=true&w=majority
```

> No manual schema setup is needed — Mongoose will create collections automatically on first run.

---

### Step 4 — Configure Environment Variables

Create a `.env` file in the root directory of the project:

```bash
cp .env.example .env
```

Then open `.env` and fill in your values (see [Environment Variables](#environment-variables) below).

---

### Step 5 — Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start at:

```
http://localhost:5000
```

> The port can be changed via the `PORT` variable in your `.env` file.

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following keys:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/construction_db
# For Atlas: mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/construction_db

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Cookie
COOKIE_EXPIRES_IN=7
```

> ⚠️ Never commit your `.env` file to version control. It is already listed in `.gitignore`.

---

## 📡 API Endpoints

All endpoints are prefixed with `/api` unless otherwise noted.

### Authentication

| Method | Endpoint          | Description              | Access  |
|--------|-------------------|--------------------------|---------|
| POST   | `/auth/register`  | Register a new user      | Public  |
| POST   | `/auth/login`     | Login and receive JWT    | Public  |

**Register — Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "9876543210"
}
```

**Login — Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

---

### Projects

> Requires `Authorization: Bearer <token>` header for all project routes.

| Method | Endpoint          | Description                        | Access          |
|--------|-------------------|------------------------------------|-----------------|
| POST   | `/projects`       | Create a new project               | Admin / Manager |
| GET    | `/projects`       | List all projects (paginated)      | All             |
| GET    | `/projects/:id`   | Get project details with tasks/DPR | All             |
| PUT    | `/projects/:id`   | Update a project                   | Admin / Manager |
| DELETE | `/projects/:id`   | Delete a project                   | Admin only      |

**Create Project — Request Body:**
```json
{
  "name": "Bridge Construction",
  "description": "Overpass on NH-44",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "budget": 5000000,
  "location": "Nagpur, Maharashtra"
}
```

**GET /projects — Query Params:**

| Param    | Type    | Description                        |
|----------|---------|------------------------------------|
| `status` | string  | Filter by status (optional)        |
| `limit`  | integer | Number of results per page         |
| `offset` | integer | Number of records to skip          |

---

### Daily Progress Reports (DPR)

| Method | Endpoint                  | Description                    | Access  |
|--------|---------------------------|--------------------------------|---------|
| POST   | `/projects/:id/dpr`       | Create a DPR for a project     | Auth    |
| GET    | `/projects/:id/dpr`       | List DPRs for a project        | Auth    |

**Create DPR — Request Body:**
```json
{
  "date": "2025-06-15",
  "work_description": "Foundation work completed for Block A",
  "weather": "Sunny",
  "worker_count": 42
}
```

**GET DPRs — Query Params:**

| Param  | Type   | Description                     |
|--------|--------|---------------------------------|
| `date` | string | Filter DPRs by specific date (optional) |

---

## 📁 Project Structure

```
├── config/
│   └── db.js                 # MongoDB connection (Mongoose)
├── controllers/
│   ├── authController.js
│   ├── projectController.js
│   └── dprController.js
├── middleware/
│   ├── authMiddleware.js      # JWT & cookie verification
│   └── roleMiddleware.js      # Role-based access control
├── models/
│   ├── User.js               # Mongoose schema
│   ├── Project.js
│   └── DPR.js
├── routes/
│   ├── authRoutes.js
│   ├── projectRoutes.js
│   └── dprRoutes.js
├── .env.example
├── .gitignore
├── package.json
└── server.js                  # Entry point
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a new feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

> Built with ❤️ for efficient construction site management.
