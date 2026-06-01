from fastapi import APIRouter, UploadFile, File, BackgroundTasks, Form, HTTPException
from fastapi.responses import FileResponse

from pdf2image import convert_from_path
from zipfile import ZipFile

import os
import uuid

router = APIRouter()

UPLOAD_DIR = "uploads"
CONVERTED_DIR = "converted"

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB
MAX_PAGES = 100

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(CONVERTED_DIR, exist_ok=True)


def cleanup_files(*paths):
    for path in paths:
        if path and os.path.exists(path):
            try:
                os.remove(path)
            except:
                pass


@router.post("/pdf-to-img")
async def pdf_to_img(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    format: str = Form("jpg")
):

    # Validate format
    allowed_formats = ["jpg", "jpeg", "png"]

    if format.lower() not in allowed_formats:
        raise HTTPException(
            status_code=400,
            detail="Supported formats: jpg, jpeg, png"
        )

    unique_name = str(uuid.uuid4())

    original_name = os.path.splitext(file.filename)[0]

    pdf_path = os.path.join(
        UPLOAD_DIR,
        f"{unique_name}.pdf"
    )

    # Read uploaded file
    content = await file.read()

    # File size limit
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="PDF exceeds 50MB limit"
        )

    # Save PDF
    with open(pdf_path, "wb") as f:
        f.write(content)

    try:

        images = convert_from_path(
            pdf_path,
            dpi=150
        )

        # Page limit
        if len(images) > MAX_PAGES:

            background_tasks.add_task(
                cleanup_files,
                pdf_path
            )

            raise HTTPException(
                status_code=400,
                detail="PDF exceeds 100 pages limit"
            )

        # SINGLE PAGE PDF
        if len(images) == 1:

            image_path = os.path.join(
                CONVERTED_DIR,
                f"{unique_name}.{format}"
            )

            images[0].save(
                image_path,
                format.upper()
            )

            background_tasks.add_task(
                cleanup_files,
                pdf_path,
                image_path
            )

            return FileResponse(
                path=image_path,
                media_type=f"image/{format}",
                filename=f"{original_name}.{format}"
            )

        # MULTI PAGE PDF → ZIP

        zip_path = os.path.join(
            CONVERTED_DIR,
            f"{unique_name}.zip"
        )

        temp_files = []

        with ZipFile(zip_path, "w") as zip_file:

            for index, image in enumerate(images, start=1):

                page_file = os.path.join(
                    CONVERTED_DIR,
                    f"{unique_name}_page_{index}.{format}"
                )

                image.save(
                    page_file,
                    format.upper()
                )

                zip_file.write(
                    page_file,
                    arcname=f"page_{index}.{format}"
                )

                temp_files.append(page_file)

        background_tasks.add_task(
            cleanup_files,
            pdf_path,
            zip_path,
            *temp_files
        )

        return FileResponse(
            path=zip_path,
            media_type="application/zip",
            filename=f"{original_name}.zip"
        )

    except Exception as e:

        background_tasks.add_task(
            cleanup_files,
            pdf_path
        )

        raise HTTPException(
            status_code=500,
            detail=f"Conversion failed: {str(e)}"
        )