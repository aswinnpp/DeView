#!/bin/bash

cd /var/www/app

echo "Installing dependencies..."
npm install

echo "Building app..."
npm run build || echo "No build step"
