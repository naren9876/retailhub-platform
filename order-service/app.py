from flask import Flask, request, jsonify
import logging
from datetime import datetime

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/health')
def health():
    logger.info("Health check")
    return {"status": "order-service running"}, 200

@app.route('/orders', methods=['GET'])
def get_orders():
    logger.info("GET /orders")
    return {"orders": []}, 200

@app.route('/orders', methods=['POST'])
def create_order():
    data = request.json
    logger.info(f"Creating order for {data.get('customer_id')}")
    return {"order_id": f"ord-{int(datetime.now().timestamp())}"}, 201

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003)
# Updated services
# Rebuild - requirements.txt now included
