#!/bin/bash
set -e
echo "Starting Ubuntu Server Provisioning for Cocoonz CRM..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git ufw fail2ban unzip cron

echo "Configuring Firewall..."
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw --force enable

echo "Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

echo "Installing Docker Compose..."
sudo apt-get install docker-compose-plugin -y

echo "Provisioning complete. Please reboot or log out and back in for Docker groups to take effect."
