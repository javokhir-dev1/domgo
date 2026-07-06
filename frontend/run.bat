@echo off
REM DomGo frontend - qo'lda ishga tushirish
cd /d %~dp0
if not exist node_modules (
  echo Paketlar o'rnatilmoqda...
  npm install
)
echo Frontend: http://localhost:3000
npm run dev
