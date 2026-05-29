from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pdf2image import convert_from_path
from zipfile import ZipFile

from PIL import Image

import os
import uuid

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
CONVERTED_DIR = "converted"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(CONVERTED_DIR, exist_ok=True)

@app.post("/img-to-pdf")
async def img_to_pdf(file: UploadFile = File(...)):

    unique_name = str(uuid.uuid4())

    image_path = f"{UPLOAD_DIR}/{unique_name}.png"
    pdf_path = f"{CONVERTED_DIR}/{unique_name}.pdf"

    # Save uploaded image
    with open(image_path, "wb") as f:
        f.write(await file.read())

    # Convert image to PDF
    image = Image.open(image_path)

    if image.mode == "RGBA":
        image = image.convert("RGB")

    image.save(pdf_path, "PDF")

    return FileResponse(
        pdf_path,
        media_type='application/pdf',
        filename="converted.pdf"
    )

@app.post("/pdf-to-img")
async def pdf_to_img(
    file: UploadFile = File(...),
    format: str = "png"
):

    unique_name = str(uuid.uuid4())

    pdf_path = f"{UPLOAD_DIR}/{unique_name}.pdf"

    with open(pdf_path, "wb") as f:
        f.write(await file.read())

    images = convert_from_path(
        pdf_path,
        poppler_path=r"C:\Program Files\poppler-26.02.0\Library\bin"
    )

    first_image = images[0]

    image_path = f"{CONVERTED_DIR}/{unique_name}.{format}"

    first_image.save(image_path, format.upper())

    return FileResponse(
        image_path,
        media_type=f"image/{format}",
        filename=f"converted.{format}"
    )