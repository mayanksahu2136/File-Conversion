from fastapi import APIRouter, UploadFile, File
from fastapi.responses import FileResponse
from fastapi import BackgroundTasks

from PIL import Image

import os
import uuid

router = APIRouter()

UPLOAD_DIR = "uploads"
CONVERTED_DIR = "converted"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(CONVERTED_DIR, exist_ok=True)


def cleanup_files(*paths):
    for path in paths:
        if path and os.path.exists(path):
            os.remove(path)


@router.post("/img-to-pdf")
async def img_to_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):

    # Generate unique filename
    unique_name = str(uuid.uuid4())

    # Get original filename without extension
    original_name = os.path.splitext(file.filename)[0]

    image_extension = os.path.splitext(file.filename)[1].lower()

    image_path = os.path.join(
        UPLOAD_DIR,
        f"{unique_name}{image_extension}"
    )

    pdf_path = os.path.join(
        CONVERTED_DIR,
        f"{unique_name}.pdf"
    )

    # Save uploaded image
    content = await file.read()

    with open(image_path, "wb") as f:
        f.write(content)

    # Open image
    image = Image.open(image_path)

    # Convert RGBA -> RGB
    if image.mode in ("RGBA", "P"):
        image = image.convert("RGB")

    # Save PDF
    image.save(pdf_path, "PDF")

    # Delete files after response is sent
    background_tasks.add_task(
        cleanup_files,
        image_path,
        pdf_path
    )

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"{original_name}.pdf"
    )