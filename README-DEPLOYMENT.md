# การ Deploy บน Ubuntu Server

## ขั้นตอนการติดตั้งและ Deploy

### 1. เตรียม Ubuntu Server

```bash
# อัพเดท system
sudo apt update && sudo apt upgrade -y

# ติดตั้ง dependencies พื้นฐาน
sudo apt install -y curl wget git unzip
```

### 2. ติดตั้ง Docker และ Docker Compose

```bash
# ใช้ script ที่เตรียมไว้
chmod +x install-docker.sh
./install-docker.sh

# หรือติดตั้งด้วยตนเอง
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# ติดตั้ง Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. Clone โปรเจค

```bash
git clone <your-repository-url>
cd <your-project-directory>
```

### 4. ตั้งค่า Environment

```bash
# คัดลอกและแก้ไข .env file
cp .env.example .env
nano .env

# แก้ไขค่าต่างๆ ให้เหมาะสมกับ production:
# - เปลี่ยน JWT secrets
# - ตั้งค่า database credentials
# - เปลี่ยน NODE_ENV=production
```

### 5. Deploy Application

```bash
# ให้สิทธิ์ execute script
chmod +x deploy.sh

# รัน deployment script
./deploy.sh
```

### 6. ตั้งค่า Nginx (Reverse Proxy)

```bash
# ติดตั้ง Nginx
sudo apt install -y nginx

# คัดลอก configuration
sudo cp nginx.conf /etc/nginx/sites-available/your-app
sudo ln -s /etc/nginx/sites-available/your-app /etc/nginx/sites-enabled/

# แก้ไข domain name ใน nginx.conf
sudo nano /etc/nginx/sites-available/your-app

# ทดสอบ configuration
sudo nginx -t

# เริ่ม Nginx
sudo systemctl enable nginx
sudo systemctl restart nginx
```

### 7. ตั้งค่า SSL Certificate

#### ตัวเลือก A: ไม่ใช้ SSL (HTTP เท่านั้น)
```bash
# ใช้ nginx config แบบไม่มี SSL
sudo cp nginx-no-ssl.conf /etc/nginx/sites-available/your-app
```

#### ตัวเลือก B: ใช้ฟรี domain + Let's Encrypt
```bash
# ติดตั้ง Certbot
sudo apt install -y certbot python3-certbot-nginx

# หา IP ของ server
curl ifconfig.me

# ใช้ nip.io (แทนที่ YOUR_IP ด้วย IP จริง)
sudo certbot --nginx -d YOUR_IP.nip.io

# ตั้งค่า auto-renewal
sudo crontab -e
# เพิ่มบรรทัด: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### ตัวเลือก C: Self-signed Certificate
```bash
# สร้าง self-signed certificate
chmod +x create-self-signed-cert.sh
sudo ./create-self-signed-cert.sh

# ใช้ nginx config สำหรับ self-signed
sudo cp nginx-self-signed.conf /etc/nginx/sites-available/your-app
```

### 8. ตั้งค่า Firewall

```bash
# เปิด UFW
sudo ufw enable

# อนุญาต ports ที่จำเป็น
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# ตรวจสอบสถานะ
sudo ufw status
```

## คำสั่งที่มีประโยชน์

### การจัดการ Docker Services

```bash
# ดู status ของ services
docker-compose ps

# ดู logs
docker-compose logs -f
docker-compose logs -f app  # logs ของ app เท่านั้น

# Restart services
docker-compose restart
docker-compose restart app  # restart app เท่านั้น

# Stop services
docker-compose down

# Start services
docker-compose up -d

# Update และ redeploy
git pull
docker-compose build --no-cache
docker-compose up -d
```

### การจัดการ Database

```bash
# เข้าไปใน database container
docker-compose exec postgres psql -U naphat -d nestapi

# Backup database
docker-compose exec postgres pg_dump -U naphat nestapi > backup.sql

# Restore database
docker-compose exec -T postgres psql -U naphat nestapi < backup.sql

# Run migrations
docker-compose exec app npx prisma migrate deploy

# Seed database
docker-compose exec app npx prisma db seed
```

### Monitoring และ Troubleshooting

```bash
# ดู resource usage
docker stats

# ดู disk usage
docker system df

# ทำความสะอาด unused images/containers
docker system prune -a

# ดู logs ของ Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# ตรวจสอบ service status
sudo systemctl status nginx
sudo systemctl status docker
```

## การตั้งค่าเพิ่มเติม

### 1. Process Manager (PM2) - ทางเลือก

หากต้องการใช้ PM2 แทน Docker:

```bash
# ติดตั้ง Node.js และ PM2
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

# สร้าง ecosystem file
# ดู pm2.config.js ที่สร้างไว้
```

### 2. Log Rotation

```bash
# ตั้งค่า logrotate สำหรับ Docker logs
sudo nano /etc/logrotate.d/docker-containers
```

### 3. Backup Strategy

```bash
# สร้าง backup script
# ดู backup.sh ที่สร้างไว้
chmod +x backup.sh

# ตั้งค่า cron job สำหรับ backup อัตโนมัติ
crontab -e
# เพิ่ม: 0 2 * * * /path/to/backup.sh
```

## การแก้ไขปัญหาที่พบบ่อย

### 1. Port ถูกใช้งานแล้ว
```bash
# หา process ที่ใช้ port
sudo lsof -i :4000
sudo kill -9 <PID>
```

### 2. Permission denied
```bash
# ตั้งค่า permissions
sudo chown -R $USER:$USER .
chmod -R 755 uploads
```

### 3. Database connection failed
```bash
# ตรวจสอบ database container
docker-compose logs postgres
docker-compose exec postgres pg_isready -U naphat
```

### 4. Out of disk space
```bash
# ทำความสะอาด Docker
docker system prune -a --volumes
```

## Security Checklist

- [ ] เปลี่ยน default passwords ทั้งหมด
- [ ] ตั้งค่า JWT secrets ใหม่
- [ ] เปิดใช้งาน firewall
- [ ] ติดตั้ง SSL certificate
- [ ] ตั้งค่า fail2ban
- [ ] อัพเดท system เป็นประจำ
- [ ] ตั้งค่า backup อัตโนมัติ
- [ ] Monitor logs เป็นประจำ