from fastapi import APIRouter, UploadFile, File, Depends
from app.security import get_current_user
import os, uuid, aiofiles

router = APIRouter()
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")

@router.post("/image")
async def upload_image(file: UploadFile = File(...), current_user = Depends(get_current_user)):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    ext = (file.filename or "img.jpg").split(".")[-1].lower()
    if ext not in ["jpg","jpeg","png","webp"]: ext = "jpg"
    name = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(UPLOAD_DIR, name)
    content = await file.read()
    async with aiofiles.open(path, "wb") as f:
        await f.write(content)
    return {"file_path": f"uploads/{name}"}
