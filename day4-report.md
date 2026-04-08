# 📘 Day 4 Report – Industry Immersion Program

## ◈ Technical Summary
Today I implemented environment variable management using dotenv to securely store sensitive data such as API keys and port configurations.

I also applied the controller pattern to separate route handling from business logic, improving code structure and scalability. Additionally, I implemented middleware using express.json() to handle incoming JSON requests and created a POST API with validation.

---

## ◈ Bug Log

### 🔴 Issue: POST API not working in browser
- Problem: Received "Cannot GET /api/register"
- Cause: Browser sends GET request while route expects POST
- Solution: Used Thunder Client to send POST request
- Result: API worked successfully

---

## ◈ Conceptual Reflection

Environment variables (.env) are used to securely store sensitive information such as API keys, database URLs, and configuration values.

Hardcoding such values in source code is risky because if the repository is shared publicly, sensitive data can be exposed. Using .env files ensures better security and flexibility across different environments.

---

## ◈ HTTP Status Codes Used
- 201 Created → Successful registration
- 400 Bad Request → Missing required fields