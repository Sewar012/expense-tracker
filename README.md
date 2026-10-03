# Expense Tracker Application

A full-stack web application built to track personal expenses, connect to a RESTful API backend, and persist data in a PostgreSQL database.

## Features

### Backend & API
- Express server set up with full RESTful API routes (`GET`, `POST`, `PUT`, `DELETE`).
- Secure PostgreSQL database connectivity using `pg` Pool and environment variables.
- Parameterized queries (`$1`, `$2`) to prevent SQL injection vulnerabilities.
- Comprehensive error handling and status codes (`400` for invalid ID/inputs, `404` for missing records, `500` for server errors).
- Enabled `cors` middleware for cross-origin client communication.

### Frontend & UI
- Dynamic dashboard displaying real-time summary metrics (Total Amount, Total Expense Count, Highest Expense).
- Complete CRUD operations (Add, Edit, Delete expenses) with instant table and card updates without page refresh.
- Category filtering (Food, Transport, Bills, Entertainment, Other).
- Fully responsive layout built with Bootstrap 5 and custom **CSS Grid**.

---

## Tech Stack

- **Frontend:** HTML5, CSS3 (CSS Grid), JavaScript (ES6+, Async/Await, Fetch API), Bootstrap 5
- **Backend:** Node.js, Express.js, CORS, Dotenv
- **Database:** PostgreSQL

---

## How to Run the Project

### 1. Database Setup
1. Open pgAdmin (or psql) and create a database named `expense_tracker`.
2. Open the Query Tool and execute the provided `schema.sql` script to create the `expenses` table and insert initial seed data.

### 2. Backend Setup
1. Open terminal and navigate to the backend directory:
   ```bash
   cd backend