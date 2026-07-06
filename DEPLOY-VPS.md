# DomGo — Ubuntu VPS'ga deploy (Docker'siz)

Arxitektura: **Nginx** (port 80) → frontendni (`127.0.0.1:3000`) va `/api`, `/uploads` so'rovlarini backendga (`127.0.0.1:8000`) uzatadi.
Backend = FastAPI + uvicorn (SQLite, DB server kerak emas). Frontend = Next.js production build.
Ikkalasi ham **systemd** orqali doimiy ishlaydi.

> Quyida `YOUR_IP_OR_DOMAIN` ni o'zingizning server IP (masalan `123.45.67.89`) yoki domeningiz bilan almashtiring.
> Loyiha `/root/domgo` da deb hisoblanadi (siz shu yerga clone qilgansiz).

---

## 1. Kerakli paketlar

```bash
apt update
apt install -y python3 python3-venv python3-pip nginx curl

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

node -v && python3 --version   # tekshirish
```

---

## 2. Backend (FastAPI)

```bash
cd /root/domgo/backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

python seed.py        # demo ma'lumot qo'shadi (SQLite: domgo.db). E'lonlar bo'sh bo'lmasligi uchun.
deactivate
```

Tez tekshirish (ixtiyoriy):
```bash
/root/domgo/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
# boshqa terminalda: curl http://127.0.0.1:8000/health  → {"status":"ok"}
# Ctrl+C bilan to'xtating
```

---

## 3. Frontend (Next.js) — build

**Muhim:** `NEXT_PUBLIC_API_URL` build paytida "yopishtiriladi". Shuning uchun build'dan OLDIN o'rnating.
Sayt qanday manzildan ochilsa, o'sha manzilni yozing (Nginx `/api` ni backendga uzatadi):

```bash
cd /root/domgo/frontend
echo "NEXT_PUBLIC_API_URL=http://YOUR_IP_OR_DOMAIN" > .env.local

npm install
npm run build
```

> `.env.local` ni keyin o'zgartirsangiz, `npm run build` ni QAYTA ishga tushiring.

---

## 4. systemd xizmatlari (doimiy ishlashi uchun)

### Backend xizmati
```bash
cat > /etc/systemd/system/domgo-backend.service <<'EOF'
[Unit]
Description=DomGo Backend (FastAPI)
After=network.target

[Service]
User=root
WorkingDirectory=/root/domgo/backend
Environment=SECRET_KEY=BUNI-UZUN-TASODIFIY-SATRGA-ALMASHTIRING
Environment=UPLOAD_DIR=/root/domgo/backend/uploads
ExecStart=/root/domgo/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF
```

### Frontend xizmati
```bash
cat > /etc/systemd/system/domgo-frontend.service <<'EOF'
[Unit]
Description=DomGo Frontend (Next.js)
After=network.target

[Service]
User=root
WorkingDirectory=/root/domgo/frontend
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/npm start
Restart=always

[Install]
WantedBy=multi-user.target
EOF
```

### Ishga tushirish
```bash
systemctl daemon-reload
systemctl enable --now domgo-backend domgo-frontend

systemctl status domgo-backend --no-pager
systemctl status domgo-frontend --no-pager
```

---

## 5. Nginx reverse-proxy

```bash
cat > /etc/nginx/sites-available/domgo <<'EOF'
server {
    listen 80;
    server_name YOUR_IP_OR_DOMAIN;

    client_max_body_size 20M;   # rasm yuklash uchun

    # Backend API va statik uploads
    location /api/       { proxy_pass http://127.0.0.1:8000; }
    location /uploads/   { proxy_pass http://127.0.0.1:8000; }
    location /docs       { proxy_pass http://127.0.0.1:8000; }
    location /openapi.json { proxy_pass http://127.0.0.1:8000; }
    location /health     { proxy_pass http://127.0.0.1:8000; }

    # Qolgan hammasi — frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# YOUR_IP_OR_DOMAIN ni faylда ham almashtirishni unutmang!
ln -sf /etc/nginx/sites-available/domgo /etc/nginx/sites-enabled/domgo
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

---

## 6. Firewall (ixtiyoriy, tavsiya etiladi)

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
```

Endi brauzerda **http://YOUR_IP_OR_DOMAIN** ni oching. ✅

---

## 7. HTTPS (domen bo'lsa)

Domeningiz IP'ga yo'naltirilgan bo'lsa:
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d YOUR_DOMAIN
```

---

## Foydali buyruqlar

```bash
# Loglarni ko'rish
journalctl -u domgo-backend -f
journalctl -u domgo-frontend -f

# Kodni yangilagandan keyin
cd /root/domgo && git pull
cd frontend && npm install && npm run build && systemctl restart domgo-frontend
cd ../backend && source venv/bin/activate && pip install -r requirements.txt && deactivate && systemctl restart domgo-backend
```

## Diqqat
- `SECRET_KEY` ni albatta uzun tasodifiy satrga almashtiring (masalan: `openssl rand -hex 32`).
- SQLite oddiy va yetarli; katta yuklamada Postgres'ga o'tish mumkin (`DATABASE_URL` env orqali).
- `uploads/` va `domgo.db` serverda saqlanadi — backup qilib turing.
