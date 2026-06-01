from fastapi import (
    APIRouter,
    UploadFile,
    File,
    BackgroundTasks,
    Form,
    HTTPException
)

from fastapi.responses import FileResponse


try:
    from pdf2image import (
        convert_from_path,
        pdfinfo_from_path
    )
except ImportError:
    from pdf2image.pdf2image import (
        convert_from_path,
        pdfinfo_from_path
    )

try:
    from pdf2image.exceptions import (
        PDFInfoNotInstalledError,
        PDFPageCountError,
        PDFSyntaxError,
        PDFPopplerTimeoutError,
    )
except Exception:
    PDFInfoNotInstalledError = Exception
    PDFPageCountError = Exception
    PDFSyntaxError = Exception
    PDFPopplerTimeoutError = Exception
from zipfile import ZipFile

import os
import uuid
import time


router = APIRouter()

UPLOAD_DIR = "uploads"
CONVERTED_DIR = "converted"

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB
MAX_PAGES = 100

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(CONVERTED_DIR, exist_ok=True)

PILLOW_FORMATS = {
    "jpg": "JPEG",
    "jpeg": "JPEG",
    "png": "PNG"
}


def cleanup_files(*paths):
    for path in paths:
        try:
            if path and os.path.exists(path):
                os.remove(path)
        except Exception:
            pass


def delayed_cleanup(*paths):
    """
    Delay cleanup to ensure download is completed
    before files are removed.
    """
    time.sleep(60)
    cleanup_files(*paths)


@router.post("/pdf-to-img")
async def pdf_to_img(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    format: str = Form("jpg")
):

    format = format.lower()

    # Validate output format
    if format not in PILLOW_FORMATS:
        raise HTTPException(
            status_code=400,
            detail="Supported formats: jpg, jpeg, png"
        )

    # Validate uploaded file type
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    unique_name = str(uuid.uuid4())

    original_name = os.path.splitext(
        file.filename
    )[0]

    pdf_path = os.path.join(
        UPLOAD_DIR,
        f"{unique_name}.pdf"
    )

    # Read uploaded file
    content = await file.read()

    # Validate size
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="PDF exceeds 50MB limit"
        )

    # Save PDF
    with open(pdf_path, "wb") as f:
        f.write(content)

    try:
        # Allow overriding poppler binary location via environment
        poppler_path = os.getenv("POPPLER_PATH", None)

        # Get PDF information first
        pdf_info = pdfinfo_from_path(pdf_path, poppler_path=poppler_path)

        total_pages = pdf_info.get("Pages", 0)

        if total_pages > MAX_PAGES:
            background_tasks.add_task(delayed_cleanup, pdf_path)
            raise HTTPException(status_code=400, detail="PDF exceeds 100 pages limit")

        # Convert PDF pages
        images = convert_from_path(pdf_path, dpi=150, poppler_path=poppler_path)

        # SINGLE PAGE PDF
        if total_pages == 1:
            image_path = os.path.join(CONVERTED_DIR, f"{unique_name}.{format}")

            images[0].save(image_path, PILLOW_FORMATS[format])

            background_tasks.add_task(delayed_cleanup, pdf_path, image_path)

            return FileResponse(
                path=image_path,
                filename=f"{original_name}.{format}",
                media_type=f"image/{format}"
            )

        # MULTI PAGE PDF → ZIP
        zip_path = os.path.join(CONVERTED_DIR, f"{unique_name}.zip")
        temp_files = []

        with ZipFile(zip_path, "w") as zip_file:
            for page_number, image in enumerate(images, start=1):
                page_file = os.path.join(CONVERTED_DIR, f"{unique_name}_page_{page_number}.{format}")

                image.save(page_file, PILLOW_FORMATS[format])

                zip_file.write(page_file, arcname=f"page_{page_number}.{format}")

                temp_files.append(page_file)

        background_tasks.add_task(delayed_cleanup, pdf_path, zip_path, *temp_files)

        return FileResponse(
            path=zip_path,
            filename=f"{original_name}.zip",
            media_type="application/octet-stream"
        )

    except HTTPException:
        raise

    except PDFInfoNotInstalledError:
        background_tasks.add_task(delayed_cleanup, pdf_path)
        raise HTTPException(
            status_code=500,
            detail=(
                "Poppler not found. On Windows download poppler from "
                "https://github.com/oschwartz10612/poppler-windows/releases and "
                "set the POPPLER_PATH env var to the `bin` folder or add it to PATH."
            )
        )

    except PDFPopplerTimeoutError:
        background_tasks.add_task(delayed_cleanup, pdf_path)
        raise HTTPException(status_code=500, detail="Poppler timed out during conversion")

    except PDFSyntaxError as e:
        background_tasks.add_task(delayed_cleanup, pdf_path)
        raise HTTPException(status_code=400, detail=f"PDF syntax error: {str(e)}")

    except Exception as e:
        background_tasks.add_task(delayed_cleanup, pdf_path)
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")