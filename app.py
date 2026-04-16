from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from datetime import timedelta
import sqlite3
import time

app = Flask(__name__)

# JWT CONFIG
app.config["JWT_SECRET_KEY"] = "mysecretkey123"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=5)
jwt = JWTManager(app)

CORS(app)


# -----------------------------
# DATABASE HELPER
# -----------------------------
def get_db():
    conn = sqlite3.connect("smart_canteen.db")
    conn.row_factory = sqlite3.Row
    return conn


# -----------------------------
# CREATE TABLES
# -----------------------------
def create_tables():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL
    )
    """)

    # ⭐ REMOVED token column – now using order ID only
    cur.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        items TEXT,
        total REAL,
        status TEXT DEFAULT 'Preparing'
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )
    """)

    conn.commit()
    conn.close()


# -----------------------------
# BASIC ROUTE
# -----------------------------
@app.route("/")
def home():
    return jsonify({"message": "Smart Canteen Backend Running with SQLite + Live Order Status!"})


# -----------------------------
# USER LOGIN
# -----------------------------
@app.route("/login", methods=['POST'])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    if username == "admin" and password == "admin":
        token = create_access_token(identity=username)
        return jsonify({"token": token})

    return jsonify({"message": "Invalid credentials"}), 401


# -----------------------------
# SAVE ORDER
# -----------------------------
@app.route("/orders", methods=["POST"])
def save_order():
    data = request.json
    print("📥 Received order data:", data)
    items = str(data.get("items"))
    total = data.get("total")
    conn = get_db()
    cur = conn.cursor()

    # ⭐ inserting without token
    cur.execute("INSERT INTO orders (items, total, status) VALUES (?, ?, ?)",
                (items, total, "Preparing"))
    conn.commit()

    order_id = cur.lastrowid  # ⭐ this becomes order number

    conn.close()

    return jsonify({"message": "Order stored!", "order_id": order_id})


# -----------------------------
# SSE LIVE ORDER STATUS STREAM
# -----------------------------
@app.route("/order-status/live/<int:order_id>")
def order_live_status(order_id):

    def event_stream():
        last_status = None
        while True:
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT status FROM orders WHERE id=?", (order_id,))
            row = cur.fetchone()
            conn.close()

            if row:
                status = row["status"]
                if status != last_status:
                    yield f"data: {status}\n\n"
                    last_status = status
            time.sleep(2)

    return Response(event_stream(), content_type="text/event-stream")


# -----------------------------
# GET ORDER STATUS (normal API)
# -----------------------------
@app.route("/order-status/<int:order_id>", methods=["GET"])
def order_status(order_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT status FROM orders WHERE id = ?", (order_id,))
    row = cur.fetchone()
    conn.close()

    if row:
        return jsonify({"status": row["status"]})
    return jsonify({"error": "Order not found"}), 404


# -----------------------------
# ADMIN: UPDATE ORDER STATUS
# -----------------------------
@app.route("/update-status/<int:order_id>", methods=["PUT"])
def update_status(order_id):
    data = request.json
    new_status = data.get("status")

    conn = get_db()
    cur = conn.cursor()
    cur.execute("UPDATE orders SET status=? WHERE id=?", (new_status, order_id))
    conn.commit()
    conn.close()

    return jsonify({"message": "Status updated!"})


# -----------------------------
# ITEMS APIs
# -----------------------------
@app.route('/add-item', methods=['POST'])
def add_item():
    data = request.json
    name = data.get("name")
    price = data.get("price")

    conn = get_db()
    cur = conn.cursor()
    cur.execute("INSERT INTO items (name, price) VALUES (?, ?)", (name, price))
    conn.commit()
    conn.close()

    return jsonify({"message": "Item added successfully!"})


@app.route("/items", methods=['GET'])
def get_items():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id, name, price FROM items")
    rows = cur.fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])


# -----------------------------
# RUN APP
# -----------------------------
if __name__ == "__main__":
    create_tables()
    app.run(debug=True, threaded=True)
