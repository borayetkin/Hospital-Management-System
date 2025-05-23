#!/usr/bin/env python3

import requests
import json
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("public_api_test")

# API details
BASE_URL = "http://localhost:8000/api/v1"

def test_public_endpoint(endpoint):
    """Test a public API endpoint"""
    try:
        url = f"{BASE_URL}/{endpoint}"
        logger.info(f"Testing public endpoint: {url}")
        response = requests.get(url)
        
        logger.info(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                logger.info(f"Response data: {json.dumps(data, indent=2)}")
                return True, data
            except json.JSONDecodeError:
                logger.error("Failed to parse JSON response")
                logger.info(f"Raw response: {response.text}")
                return False, None
        else:
            logger.error(f"Request failed: {response.status_code}")
            logger.info(f"Response: {response.text}")
            return False, None
    except Exception as e:
        logger.error(f"Error testing endpoint: {e}")
        return False, None

def main():
    """Main test function"""
    logger.info("Starting public API tests")
    
    # Test public endpoints
    public_endpoints = [
        "public/resources/statistics",
        "public/resources/activities/recent?limit=5",
    ]
    
    for endpoint in public_endpoints:
        success, data = test_public_endpoint(endpoint)
        if success:
            logger.info(f"Public endpoint {endpoint} test: SUCCESS")
        else:
            logger.error(f"Public endpoint {endpoint} test: FAILED")
    
    logger.info("Public API tests completed")

if __name__ == "__main__":
    main() 