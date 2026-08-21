from flask import Flask, request, jsonify
import psycopg2
from psycopg2.extras import RealDictCursor
import logging
import os
from datetime import datetime

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database connection
def get_db_connection():
    conn = psycopg2.connect(
        host=os.environ.get('DB_HOST'),
        user=os.environ.get('DB_USER', 'postgres'),
        password=os.environ.get('DB_PASSWORD', 'postgres'),
        database=os.environ.get('DB_NAME', 'retailhub')
    )
    return conn

@app.route('/health')
def health():
    logger.info("Health check")
    try:
        conn = get_db_connection()
        conn.close()
        return {"status": "user-service running", "database": "connected"}, 200
    except Exception as e:
        logger.error(f"Database error: {e}")
        return {"status": "user-service running", "database": "disconnected", "error": str(e)}, 200

@app.route('/users', methods=['GET'])
def get_users():
    logger.info("GET /users")
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT id, name, email, phone FROM users ORDER BY id")
        users = cur.fetchall()
        cur.close()
        conn.close()
        return {"users": [dict(u) for u in users]}, 200
    except Exception as e:
        logger.error(f"Error fetching users: {e}")
        return {"error": str(e), "users": []}, 500

@app.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    logger.info(f"GET /users/{user_id}")
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT id, name, email, phone FROM users WHERE id = %s", (user_id,))
        user = cur.fetchone()
        cur.close()
        conn.close()
        if user:
            return {"user": dict(user)}, 200
        return {"error": "User not found"}, 404
    except Exception as e:
        logger.error(f"Error fetching user: {e}")
        return {"error": str(e)}, 500

@app.route('/users', methods=['POST'])
def create_user():
    data = request.json
    logger.info(f"Creating user {data.get('email')}")
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO users (name, email, phone) VALUES (%s, %s, %s) RETURNING id",
            (data.get('name'), data.get('email'), data.get('phone'))
        )
        user_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return {"user_id": user_id, "email": data.get('email')}, 201
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        return {"error": str(e)}, 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
