const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("smart_canteen.db");

// ALL ITEMS HERE (FULL MENU)
const items = [
  ["Idli Vada", 50, "Breakfast", "10 mins", "idli.png"],
  ["Upma", 40, "Breakfast", "12 mins", "upma.png"],
  ["Set Dosa", 40, "Breakfast", "10 mins", "upma.png"],
  ["Neer Dosa", 40, "Breakfast", "10 mins", "upma.png"],
  ["Poha", 25, "Breakfast", "10 mins", "upma.png"],
  ["Paddu", 35, "Breakfast", "10 mins", "upma.png"],
  ["Thatte Idli", 30, "Breakfast", "15 mins", "upma.png"],
  ["Puri Bhaji", 40, "Breakfast", "15 mins", "upma.png"],
  ["Aloo Paratha", 45, "Breakfast", "10 mins", "upma.png"],

  ["Veg Thali", 120, "Lunch", "25 mins", "vegthali.png"],
  ["Rice Sambhar", 30, "Lunch", "5 mins", "ricesambhar.png"],
  ["Bisi Bele Bath", 40, "Lunch", "15 mins", "ricesambhar.png"],
  ["Puliyogare", 30, "Lunch", "8 mins", "ricesambhar.png"],
  ["Vangi Bath", 30, "Lunch", "5 mins", "ricesambhar.png"],
  ["Curd Rice", 30, "Lunch", "3 mins", "ricesambhar.png"],
  ["Ragi Mudde with Sambar", 35, "Lunch", "15 mins", "ricesambhar.png"],
  ["Lemon Rice", 35, "Lunch", "8 mins", "ricesambhar.png"],

  ["Mangalore Bajji", 30, "Snacks", "8 mins", "masaladosa.png"],
  ["Maddur Vada", 25, "Snacks", "8 mins", "masaladosa.png"],
  ["Nippattu", 10, "Snacks", "5 mins", "masaladosa.png"],
  ["Bonda", 25, "Snacks", "10 mins", "masaladosa.png"],
  ["Pakoda", 25, "Snacks", "6 mins", "masaladosa.png"],
  ["Mysore Avalakki", 15, "Snacks", "3 mins", "masaladosa.png"],

  ["Filter Coffee", 15, "Beverages", "5 mins", "filtercoffee.png"],
  ["Buttermilk", 10, "Beverages", "4 mins", "buttermilk.png"],
  ["Tea (Masala/Plain)", 10, "Beverages", "4 mins", "buttermilk.png"],
  ["Badam Milk", 25, "Beverages", "4 mins", "buttermilk.png"],

  ["Kesari Bath", 25, "Desserts", "10 mins", "kesaribath.png"],
  ["Holige", 80, "Desserts", "15 mins", "holige.png"],
  ["Mysore Pak", 25, "Desserts", "10 mins", "holige.png"],
  ["Kheer", 30, "Desserts", "15 mins", "holige.png"],
  ["Jalebi", 25, "Desserts", "15 mins", "holige.png"],
];

db.serialize(() => {
  db.run(`ALTER TABLE items ADD COLUMN category TEXT`, () => {});
  db.run(`ALTER TABLE items ADD COLUMN time TEXT`, () => {});
  db.run(`ALTER TABLE items ADD COLUMN image TEXT`, () => {});

  items.forEach((item) => {
    db.run(
      "INSERT INTO items (name, price, category, time, image) VALUES (?, ?, ?, ?, ?)",
      item
    );
  });

  console.log("🎉 All menu items inserted successfully!");
});

db.close();
