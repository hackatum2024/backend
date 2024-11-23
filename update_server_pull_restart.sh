#!/usr/bin/env bash

git pull

bun install

pm2 stop backend 
pm2 delete backend
pm2 start bun --name "backend" -- --bun -- run start

