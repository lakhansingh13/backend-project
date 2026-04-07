# 📘 Day 3 Report – Industry Immersion Program

## ◈ Setup Status
- VS Code installed and configured
- Node.js (LTS) installed successfully
- npm working correctly
- Express installed and server running on localhost:3000
- Terminal configured to use CMD (resolved PowerShell issue)

---

## ◈ Task Inventory
- Created backend project using npm init
- Installed Express framework
- Built a basic server using Express
- Created a route ("/") and sent response to browser
- Ran server using node and nodemon
- Learned how to use nodemon for auto-restart
- Tested server in browser using localhost

---

## ◈ Debugging Log

### 🔴 Issue 1: npm not working in PowerShell
- Error: "running scripts is disabled on this system"
- Solution: Switched terminal from PowerShell to CMD
- Result: npm commands started working properly

### 🔴 Issue 2: Changes not reflecting in browser
- Problem: Updated code was not visible
- Cause: Server was not restarting automatically / browser cache
- Solution:
  - Used nodemon for auto-restart
  - Used hard refresh (Ctrl + Shift + R)
  - Ensured file was saved
- Result: Changes reflected successfully

---

## ◈ Key Insights
- Learned that Node.js server does not auto-restart without tools like nodemon
- Understood the importance of terminal environment (CMD vs PowerShell)
- Realized how browser caching can affect backend testing
- Aha Moment 💡: "Even if code is correct, environment issues can break execution"

---

## 🚀 Conclusion
Day 3 helped me move from setup to execution by building my first backend server and understanding real-world debugging scenarios.