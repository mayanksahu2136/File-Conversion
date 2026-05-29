from fastapi import FastAPI, UploadFile, File, BackgroundTasks
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from pdf2image import convert_from_path
from PIL import Image

import os
import uuid

app = FastAPI()

# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# Folders
# =========================

UPLOAD_DIR = "uploads"
CONVERTED_DIR = "converted"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(CONVERTED_DIR, exist_ok=True)

# =========================
# Poppler Path
# =========================

POPPLER_PATH = r"C:\Program Files\poppler-26.02.0\Library\bin"

# =========================
# Helper Function
# =========================

def remove_file(path: str):

    if os.path.exists(path):
        os.remove(path)

# =========================
# Image → PDF
# =========================

@app.post("/img-to-pdf")
async def img_to_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):

    unique_name = str(uuid.uuid4())

    original_name = os.path.splitext(file.filename)[0]

    image_path = f"{UPLOAD_DIR}/{unique_name}.png"

    pdf_path = f"{CONVERTED_DIR}/{unique_name}.pdf"

    # Save uploaded image

    with open(image_path, "wb") as f:
        f.write(await file.read())

    # Open image

    image = Image.open(image_path)

    # Convert RGBA to RGB

    if image.mode == "RGBA":
        image = image.convert("RGB")

    # Save PDF

    image.save(pdf_path, "PDF")

    # Auto delete files after response

    background_tasks.add_task(remove_file, image_path)

    background_tasks.add_task(remove_file, pdf_path)

    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=f"{original_name}.pdf",
        background=background_tasks
    )

# =========================
# PDF → Image
# =========================

@app.post("/pdf-to-img")
async def pdf_to_img(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    format: str = "png"
):

    unique_name = str(uuid.uuid4())

    original_name = os.path.splitext(file.filename)[0]

    pdf_path = f"{UPLOAD_DIR}/{unique_name}.pdf"

    # Save uploaded PDF

    with open(pdf_path, "wb") as f:
        f.write(await file.read())

    # Convert PDF to images

    images = convert_from_path(
        pdf_path,
        dpi=100,
        poppler_path=POPPLER_PATH
    )

    # Take first page

    first_image = images[0]

    image_path = f"{CONVERTED_DIR}/{unique_name}.{format}"

    # Save image

    first_image.save(
        image_path,
        format.upper()
    )

    # Auto delete files after response

    background_tasks.add_task(remove_file, pdf_path)

    background_tasks.add_task(remove_file, image_path)

    return FileResponse(
        image_path,
        media_type=f"image/{format}",
        filename=f"{original_name}.{format}",
        background=background_tasks
    )