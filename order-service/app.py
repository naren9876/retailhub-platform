from flask import Flask
app = Flask(__name__)

@app.route('/health')
def health():
    return {"status": "order-service running"}

@app.route('/orders', methods=['GET'])
def get_orders():
    return {"orders": []}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003)
