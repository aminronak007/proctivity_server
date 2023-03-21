#!/bin/bash
cd /var/www/html/server
sudo chmod -R 777 /var/www/html/server
npm install
pm2 restart backend
