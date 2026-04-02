const express = require("express");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Read users from file
function getUsers() {
  if (!fs.existsSync("users.json")) {
    fs.writeFileSync("users.json", JSON.stringify([]));
  }
  return JSON.parse(fs.readFileSync("users.json"));
}

// Register API
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  const users = getUsers();

  const userExists = users.find(u => u.username === username);
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  users.push({ username, password: hashedPassword });
  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));

  res.json({ message: "Registration successful" });
});

// Login API
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const users = getUsers();

  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  res.json({ message: "Login successful" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
