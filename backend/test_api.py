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
logger = logging.getLogger("api_test")

# API details
BASE_URL = "http://localhost:8000/api/v1"

def get_token():
    """Get authentication token"""
    try:
        auth_data = {
            "username": "doctor@example.com",  # Try a different user
            "password": "password"
        }
        
        response = requests.post(
            f"{BASE_URL}/auth/token",
            data=auth_data
        )
        
        if response.status_code == 200:
            token_data = response.json()
            return token_data.get("access_token")
        else:
            logger.error(f"Authentication failed: {response.status_code} - {response.text}")
            
            # Try with another user if first one fails
            auth_data = {
                "username": "admin@example.com",
                "password": "password"
            }
            
            response = requests.post(
                f"{BASE_URL}/auth/token",
                data=auth_data
            )
            
            if response.status_code == 200:
                token_data = response.json()
                return token_data.get("access_token")
            else:
                logger.error(f"Second authentication attempt failed: {response.status_code} - {response.text}")
                return None
    except Exception as e:
        logger.error(f"Error getting token: {e}")
        return None

def test_endpoint(endpoint, token=None):
    """Test a specific API endpoint"""
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    try:
        logger.info(f"Testing endpoint: {endpoint}")
        response = requests.get(f"{BASE_URL}/{endpoint}", headers=headers)
        
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
    logger.info("Starting API tests")
    
    # Get token
    token = get_token()
    if not token:
        logger.error("Failed to get authentication token")
        return
    
    logger.info("Successfully obtained authentication token")
    
    # Test endpoints
    endpoints = [
        "resources/",
        "resources/statistics",
        "resources/activities/recent?limit=5",
    ]
    
    for endpoint in endpoints:
        success, data = test_endpoint(endpoint, token)
        if success:
            logger.info(f"Endpoint {endpoint} test: SUCCESS")
        else:
            logger.error(f"Endpoint {endpoint} test: FAILED")
    
    logger.info("API tests completed")

if __name__ == "__main__":
    main() 