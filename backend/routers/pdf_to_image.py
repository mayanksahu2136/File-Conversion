from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    HTTPException
)

from fastapi.responses import FileResponse

from pdf2image import (
    convert_from_path,
    pdfinfo_from_path
)

from pdf2image.exceptions import (
    PDFInfoNotInstalledError,
    PDFPageCountError,
    PDFSyntaxError,
    PDFPopplerTimeoutError
)

import os
import uuid

router = APIRouter()

UPLOAD_DIR = "uploads"
CONVERTED_DIR = "converted"

MAX_FILE_SIZE = 50 * 1024 * 1024
MAX_PAGES = 100

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(CONVERTED_DIR, exist_ok=True)

PILLOW_FORMATS = {
    "jpg": "JPEG",
    "jpeg": "JPEG",
    "png": "PNG"
}


def safe_remove(path):
    try:
        if os.path.exists(path):
            os.remove(path)
    except Exception:
        pass


@router.post("/pdf-to-img")
async def pdf_to_img(
    file: UploadFile = File(...),
    format: str = Form("png")
):

    format = format.lower()

    if format not in PILLOW_FORMATS:
        raise HTTPException(
            status_code=400,
            detail="Supported formats: png, jpg, jpeg"
        )

    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    content = await file.read()

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="PDF exceeds 50MB limit"
        )

    unique_id = str(uuid.uuid4())

    original_name = os.path.splitext(
        file.filename
    )[0]

    pdf_path = os.path.join(
        UPLOAD_DIR,
        f"{unique_id}.pdf"
    )

    with open(pdf_path, "wb") as f:
        f.write(content)

    try:

        poppler_path = os.getenv(
            "POPPLER_PATH",
            None
        )

        pdf_info = pdfinfo_from_path(
            pdf_path,
            poppler_path=poppler_path
        )

        total_pages = pdf_info.get(
            "Pages",
            0
        )

        if total_pages > MAX_PAGES:
            safe_remove(pdf_path)

            raise HTTPException(
                status_code=400,
                detail="PDF exceeds 100 pages limit"
            )

        images = convert_from_path(
            pdf_path,
            dpi=150,
            poppler_path=poppler_path
        )

        result_images = []

        for page_number, image in enumerate(
            images,
            start=1
        ):

            image_filename = (
                f"{original_name}_page_{page_number}.{format}"
            )

            image_path = os.path.join(
                CONVERTED_DIR,
                image_filename
            )

            image.save(
                image_path,
                PILLOW_FORMATS[format]
            )

            result_images.append({
                "page": page_number,
                "filename": image_filename,
                "download_url": f"/download/{image_filename}"
            })

        safe_remove(pdf_path)

        return {
            "success": True,
            "original_file": file.filename,
            "total_pages": total_pages,
            "format": format,
            "images": result_images
        }

    except PDFInfoNotInstalledError:

        safe_remove(pdf_path)

        raise HTTPException(
            status_code=500,
            detail="Poppler is not installed on the server"
        )

    except PDFPageCountError:

        safe_remove(pdf_path)

        raise HTTPException(
            status_code=400,
            detail="Unable to read PDF pages"
        )

    except PDFSyntaxError:

        safe_remove(pdf_path)

        raise HTTPException(
            status_code=400,
            detail="Invalid PDF file"
        )

    except PDFPopplerTimeoutError:

        safe_remove(pdf_path)

        raise HTTPException(
            status_code=500,
            detail="PDF conversion timed out"
        )

    except Exception as e:

        safe_remove(pdf_path)

        raise HTTPException(
            status_code=500,
            detail=f"Conversion failed: {str(e)}"
        )


@router.get("/download/{filename}")
async def download_image(filename: str):

    file_path = os.path.join(
        CONVERTED_DIR,
        filename
    )

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    ext = filename.split(".")[-1].lower()

    media_types = {
        "png": "image/png",
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg"
    }

    return FileResponse(
        path=file_path,
        filename=filename,
        media_type=media_types.get(
            ext,
            "application/octet-stream"
        )
    )