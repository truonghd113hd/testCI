#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Run K6 test with environment variables
echo "🚀 Running K6 Load Test..."
echo "📍 Target: $K6_LOGIN_URL"
echo "👥 Test Users: ${K6_TEST_USER_1_EMAIL}, ${K6_TEST_USER_2_EMAIL}, ${K6_TEST_USER_3_EMAIL}"
echo ""

k6 run scripts/advanced-test-UAT-Zenia.js