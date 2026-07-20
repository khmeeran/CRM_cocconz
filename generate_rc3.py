import os

def create_script(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
        
def generate_rc3():
    project_root = r"E:\CRM_Cocoonz"
    scripts_dir = os.path.join(project_root, "deploy_scripts")
    
    install_server = """#!/bin/bash
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
"""
    create_script(os.path.join(scripts_dir, "install_server.sh"), install_server)
    
    deploy = """#!/bin/bash
set -e
echo "Deploying Cocoonz CRM..."

if [ ! -f .env ]; then
    echo "ERROR: .env file is missing! Please copy .env.production to .env and fill in the values."
    exit 1
fi

echo "Pulling latest code and building containers..."
docker compose pull
docker compose up -d --build

echo "Deployment finished. Checking health..."
./deploy_scripts/health_check.sh
"""
    create_script(os.path.join(scripts_dir, "deploy.sh"), deploy)

    update = """#!/bin/bash
set -e
echo "Updating Cocoonz CRM..."
git pull origin main
docker compose up -d --build
echo "Update complete."
"""
    create_script(os.path.join(scripts_dir, "update.sh"), update)
    
    backup = """#!/bin/bash
set -e
BACKUP_DIR="/opt/cocoonz_backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p $BACKUP_DIR

echo "Dumping database..."
docker exec -t crm_cocoonz-db-1 pg_dumpall -c -U school_user > $BACKUP_DIR/db_dump_$TIMESTAMP.sql
echo "Backup saved to $BACKUP_DIR/db_dump_$TIMESTAMP.sql"
"""
    create_script(os.path.join(scripts_dir, "backup.sh"), backup)

    restore = """#!/bin/bash
set -e
if [ -z "$1" ]; then
    echo "Usage: ./restore.sh <path_to_sql_file>"
    exit 1
fi
echo "Restoring database from $1..."
cat $1 | docker exec -i crm_cocoonz-db-1 psql -U school_user
echo "Restore complete."
"""
    create_script(os.path.join(scripts_dir, "restore.sh"), restore)
    
    health_check = """#!/bin/bash
echo "Running Health Checks..."
HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}\n" http://localhost:8000/api/health/liveness)
if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "Backend is HEALTHY."
else
    echo "Backend is UNHEALTHY (Status: $HTTP_STATUS)."
    exit 1
fi
"""
    create_script(os.path.join(scripts_dir, "health_check.sh"), health_check)

generate_rc3()
print("RC3 Scripts generated.")
