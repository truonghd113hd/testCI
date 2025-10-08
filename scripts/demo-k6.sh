#!/bin/bash

echo "🚀 K6 Load Testing Demo"
echo "======================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Setup Testing Environment${NC}"
make k6-setup
sleep 5

echo -e "${BLUE}2. Running Basic Load Test (20 users, 30s)${NC}"
VUS=20 DURATION=30s npm run k6:ci

echo -e "${BLUE}3. Running Advanced Load Test with Stages${NC}"
npm run k6:advanced

echo -e "${BLUE}4. Running Load Test with InfluxDB Metrics${NC}"
npm run k6:influx

echo -e "${GREEN}✅ Demo completed!${NC}"
echo -e "${YELLOW}📊 View results at:${NC}"
echo "- Grafana: http://localhost:4000 (admin/admin123)"
echo "- InfluxDB: http://localhost:8086"

echo -e "${BLUE}5. Clean up environment${NC}"
read -p "Clean up test environment? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    make k6-clean
    echo -e "${GREEN}✅ Cleanup completed${NC}"
fi