from flask import Flask, request, jsonify
import psycopg2
from psycopg2.extras import RealDictCursor
import logging
import os

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

db_conn = None

def get_db_connection():
    global db_conn
    try:
        if db_conn is None:
            db_conn = psycopg2.connect(
                host=os.environ.get('DB_HOST'),
                user=os.environ.get('DB_USER', 'postgres'),
                password=os.environ.get('DB_PASSWORD', 'postgres'),
                database=os.environ.get('DB_NAME', 'retailhub'),
                connect_timeout=5
            )
        return db_conn
    except Exception as e:
        db_conn = None
        raise e

@app.route('/health')
def health():
    return {"status": "order-service running"}, 200

@app.route('/orders', methods=['GET'])
def get_orders():
    logger.info("GET /orders")
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT id, user_id, total, status, created_at FROM orders ORDER BY id DESC LIMIT 100")
        orders = cur.fetchall()
        cur.close()
        return {"orders": [dict(o) for o in orders]}, 200
    except Exception as e:
        logger.error(f"Error fetching orders: {e}")
        return {"error": str(e), "orders": []}, 500

@app.route('/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    logger.info(f"GET /orders/{order_id}")
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT id, user_id, total, status, created_at FROM orders WHERE id = %s", (order_id,))
        order = cur.fetchone()
        cur.close()
        if order:
            return {"order": dict(order)}, 200
        return {"error": "Order not found"}, 404
    except Exception as e:
        return {"error": str(e)}, 500

@app.route('/orders', methods=['POST'])
def create_order():
    data = request.json
    logger.info(f"Creating order for user {data.get('user_id')}")
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO orders (user_id, total, status) VALUES (%s, %s, %s) RETURNING id",
            (data.get('user_id'), data.get('total'), 'pending')
        )
        order_id = cur.fetchone()[0]
        
        for item in data.get('items', []):
            cur.execute(
                "INSERT INTO order_items (order_id, product_id, quantity) VALUES (%s, %s, %s)",
                (order_id, item.get('product_id'), item.get('quantity'))
            )
        
        conn.commit()
        cur.close()
        return {"order_id": order_id, "status": "pending"}, 201
    except Exception as e:
        logger.error(f"Error creating order: {e}")
        return {"error": str(e)}, 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003)
