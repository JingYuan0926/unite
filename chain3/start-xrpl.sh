#!/bin/bash

echo "🚀 Starting XRPL Escrow TEE server with connection testing..."

# Test connections first
echo "Step 1: Testing XRPL connections..."
node src/xrpl/testConnection.js

echo ""
echo "Step 2: Starting server..."
node src/xrpl/xrplEscServer.js 