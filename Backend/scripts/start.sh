#!/bin/bash

cd /var/www/app

echo "Starting app..."

pm2 restart all || pm2 start index.js
