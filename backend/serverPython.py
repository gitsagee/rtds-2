from flask import Flask, request, jsonify
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/get-gpu-pricing', methods=['POST'])
def get_gpu_pricing():
    data = request.get_json()
    region = data.get('region')

    
    if region == 'mumbai':
        api_url = 'https://customer.acecloudhosting.com/api/v1/pricing?is_gpu=true&resource=instances&region=ap-south-mum-1'
    elif region == 'noida':
        api_url = 'https://customer.acecloudhosting.com/api/v1/pricing?is_gpu=true&resource=instances&region=ap-south-noi-1'
    elif region == 'us-east':
        api_url = 'https://customer.acecloudhosting.com/api/v1/pricing?is_gpu=true&resource=instances&region=us-east-at-1'
    else:
        return jsonify({'error': 'Invalid region provided'}), 400

    try:
        response = requests.get(api_url)
        return jsonify(response.json())
    except Exception as e:
        print(f"Error fetching data: {str(e)}")
        return jsonify({'error': 'Failed to fetch GPU pricing data'}), 500

if __name__ == '__main__':
    app.run(port=5000)
