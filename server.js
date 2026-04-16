const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(cors());

// -----------------------------------------------------
// Load existing items + orders (or create empty files)
// -----------------------------------------------------
let items = [];
let orders = [];

if (fs.existsSync("items.json")) {
  items = JSON.parse(fs.readFileSync("items.json"));
} else {
  fs.writeFileSync("items.json", JSON.stringify([]));
}

if (fs.existsSync("orders.json")) {
  orders = JSON.parse(fs.readFileSync("orders.json"));
} else {
  fs.writeFileSync("orders.json", JSON.stringify([]));
}

// -----------------------------------------------------
// ADD ITEM  (Admin Panel)
// -----------------------------------------------------
app.post("/add-item", (req, res) => {
  const item = req.body;

  if (!item.name || !item.price || !item.category) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  items.push(item);
  fs.writeFileSync("items.json", JSON.stringify(items, null, 2));

  res.json({ message: "Item added!", item });
});

// -----------------------------------------------------
// GET ALL ITEMS (Frontend Menu)
// -----------------------------------------------------
app.get("/items", (req, res) => {
  res.json(items);
});

// -----------------------------------------------------
// PLACE ORDER (Token Page → Backend)
// -----------------------------------------------------
app.post("/api/orders", (req, res) => {
  const order = req.body;

  // 1. Check for required data (removed order.token check)
  if (!order.items || !order.total) { 
    return res.status(400).json({ message: "Invalid order format: Missing items or total" });
  }

  // 2. Generate the token on the server side
  const token = "T" + Date.now().toString().slice(-4); // Simple token: T + last 4 digits of timestamp
  order.token = token; // Add the token to the order object

  // 3. Save the new order
  orders.push(order);
  fs.writeFileSync("orders.json", JSON.stringify(orders, null, 2));

  // 4. Return the token in the response so the frontend can use it
  res.json({ 
    message: "Order received!", 
    order: order,
    token: token // ⬅️ CRITICAL FIX: Frontend needs this field!
  });
});

// -----------------------------------------------------
// ADMIN: GET ALL ORDERS
// -----------------------------------------------------
app.get("/api/orders", (req, res) => {
  res.json(orders);
});

// -----------------------------------------------------
// START SERVER
// -----------------------------------------------------
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});