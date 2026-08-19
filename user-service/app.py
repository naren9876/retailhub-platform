from flask import Flask, request, jsonify
import logging
from datetime import datetime

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/health')
def health():
    logger.info("Health check")
    return {"status": "user-service running"}, 200

@app.route('/users', methods=['GET'])
def get_users():
    logger.info("GET /users")
    return {"users": []}, 200

@app.route('/users', methods=['POST'])
def create_user():
    data = request.json
    logger.info(f"Creating user {data.get('email')}")
    return {"customer_id": f"cust-{int(datetime.now().timestamp())}"}, 201

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
