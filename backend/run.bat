@echo off
REM DomGo backend - qo'lda ishga tushirish
cd /d %~dp0
if not exist venv (
  echo [1/3] Virtual muhit yaratilmoqda...
  python -m venv venv
)
call venv\Scripts\activate.bat
echo [2/3] Kutubxonalar o'rnatilmoqda...
pip install -q -r requirements.txt
echo [3/3] Demo ma'lumot + server (http://localhost:8000/docs)
python seed.py
uvicorn app.main:app --reload --port 8000
