from fastapi import (
    APIRouter,
    UploadFile,
    File,
    BackgroundTasks,
    Form,
    HTTPException,
)

from fastapi.responses import FileResponse, JSONResponse

from pdf2image import convert_from_path, pdfinfo_from_path

try:
    from pdf2image.exceptions import (
        PDFInfoNotInstalledError,
        PDFPageCountError,
        PDFSyntaxError,
        PDFPopplerTimeoutError,
    )
except Exception:
    class PDFInfoNotInstalledError(Exception):
        pass

    class PDFPageCountError(Exception):
        pass

    class PDFSyntaxError(Exception):
        pass

    class PDFPopplerTimeoutError(Exception):
        pass

import os
import uuid
import time
import re
import logging
import shutil
import subprocess


router = APIRouter()


# Use absolute directories relative to the backend package so paths are predictable on Render
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
CONVERTED_DIR = os.path.join(BASE_DIR, "converted")

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB
MAX_PAGES = 100

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(CONVERTED_DIR, exist_ok=True)

PILLOW_FORMATS = {"jpg": "JPEG", "jpeg": "JPEG", "png": "PNG"}


# Logger
logger = logging.getLogger("pdf_to_image")
logger.setLevel(logging.INFO)
if not logger.handlers:
    ch = logging.StreamHandler()
    ch.setLevel(logging.INFO)
    formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
    ch.setFormatter(formatter)
    logger.addHandler(ch)

# Optional S3 support: if S3_BUCKET set, try to initialize boto3 client
s3_client = None
s3_bucket = os.getenv("S3_BUCKET")
if s3_bucket:
    try:
        import boto3

        s3_client = boto3.client("s3")
        logger.info("S3 client initialized for bucket %s", s3_bucket)
    except Exception as e:
        logger.warning("Failed to initialize S3 client: %s", e)
        s3_client = None


def _check_poppler_available(poppler_path: str | None = None) -> bool:
    """Return True if `pdfinfo` is available either in PATH or in poppler_path."""
    if poppler_path:
        pdfinfo = os.path.join(poppler_path, "pdfinfo")
        if os.name == "nt":
            pdfinfo = pdfinfo + ".exe"
        if os.path.exists(pdfinfo):
            try:
                out = subprocess.check_output([pdfinfo, "-v"], stderr=subprocess.STDOUT, timeout=5)
                logger.info("Found poppler pdfinfo: %s", out.decode(errors="ignore").strip())
                return True
            except Exception as e:
                logger.warning("pdfinfo found but failed to execute: %s", e)
                return False

    # check system PATH
    if shutil.which("pdfinfo"):
        try:
            out = subprocess.check_output([shutil.which("pdfinfo"), "-v"], stderr=subprocess.STDOUT, timeout=5)
            logger.info("Found poppler pdfinfo: %s", out.decode(errors="ignore").strip())
            return True
        except Exception as e:
            logger.warning("pdfinfo in PATH but failed to execute: %s", e)

    logger.warning("Poppler (pdfinfo/pdftoppm) not found. Conversions will fail without it.")
    return False


def _sanitize_name(name: str) -> str:
    # keep alphanumerics, dot, underscore and dash
    return re.sub(r"[^A-Za-z0-9_.-]", "_", name)


def _safe_join(base: str, *paths: str) -> str:
    """Join and ensure the resulting path is under base directory."""
    candidate = os.path.normpath(os.path.join(base, *paths))
    base_norm = os.path.normpath(os.path.abspath(base))
    if not os.path.abspath(candidate).startswith(base_norm):
        raise ValueError("Unsafe path")
    return candidate


def _delayed_cleanup(delay: int, *paths: str):
    time.sleep(delay)
    for p in paths:
        try:
            if p and os.path.exists(p):
                os.remove(p)
                logger.info("Cleaned up: %s", p)
        except Exception as e:
            logger.warning("Failed to remove %s: %s", p, e)


@router.post("/pdf-to-img")
async def pdf_to_img(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    format: str = Form("png"),
):
    """Convert an uploaded PDF into one image per page and return JSON with download URLs.

    Files are stored temporarily under `converted/` and served via `/download/{filename}`.
    Cleanup runs in background after a delay.
    """

    format = format.lower()

    if format not in PILLOW_FORMATS:
        raise HTTPException(status_code=400, detail="Supported formats: png, jpg, jpeg")

    # Accept PDFs even if content type is missing/incorrect in some clients
    if not (file.filename.lower().endswith(".pdf") or file.content_type == "application/pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    content = await file.read()

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="PDF exceeds 50MB limit")

    unique_id = str(uuid.uuid4())
    original_name = _sanitize_name(os.path.splitext(file.filename)[0])

    pdf_filename = f"{unique_id}.pdf"
    pdf_path = _safe_join(UPLOAD_DIR, pdf_filename)

    with open(pdf_path, "wb") as f:
        f.write(content)

    poppler_path = os.getenv("POPPLER_PATH", None)
    if not _check_poppler_available(poppler_path):
        logger.warning("Poppler not detected; conversion may fail if not installed on the host.")

    try:
        pdf_info = pdfinfo_from_path(pdf_path, poppler_path=poppler_path)
        total_pages = int(pdf_info.get("Pages", 0))

        logger.info("PDF uploaded: %s, pages: %s", file.filename, total_pages)

        if total_pages > MAX_PAGES:
            # remove uploaded pdf immediately
            try:
                os.remove(pdf_path)
            except Exception:
                pass
            raise HTTPException(status_code=400, detail="PDF exceeds 100 pages limit")

        images = convert_from_path(pdf_path, dpi=150, poppler_path=poppler_path)

        result_images = []
        saved_paths = []

        for page_number, image in enumerate(images, start=1):
            image_filename = f"{original_name}_{unique_id}_page_{page_number}.{format}"
            image_path = _safe_join(CONVERTED_DIR, image_filename)

            image.save(image_path, PILLOW_FORMATS[format])
            saved_paths.append(image_path)

            # Default to local download route
            download_url = f"/download/{image_filename}"

            # If S3 configured and client initialized, upload and return presigned URL
            if s3_client and s3_bucket:
                try:
                    key = f"pdf-to-img/{image_filename}"
                    content_type = "image/png" if format == "png" else "image/jpeg"
                    s3_client.upload_file(image_path, s3_bucket, key, ExtraArgs={"ContentType": content_type})
                    expires = int(os.getenv("S3_PRESIGNED_EXPIRES", "86400"))
                    presigned = s3_client.generate_presigned_url(
                        "get_object", Params={"Bucket": s3_bucket, "Key": key}, ExpiresIn=expires
                    )
                    download_url = presigned
                    logger.info("Uploaded %s to S3 key %s", image_filename, key)
                except Exception as e:
                    logger.warning("Failed to upload %s to S3: %s", image_filename, e)

            result_images.append({
                "page": page_number,
                "filename": image_filename,
                "download_url": download_url,
            })

            logger.info("Saved page %s to %s", page_number, image_path)

        # schedule cleanup after 10 minutes
        background_tasks.add_task(_delayed_cleanup, 600, pdf_path, *saved_paths)

        return JSONResponse({
            "success": True,
            "total_pages": total_pages,
            "images": result_images,
        })

    except PDFInfoNotInstalledError:
        try:
            os.remove(pdf_path)
        except Exception:
            pass
        logger.exception("Poppler not installed error")
        raise HTTPException(
            status_code=500,
            detail=(
                "Poppler not found on server. On Render, ensure `poppler-utils` is installed "
                "(see render.yaml). Alternatively set POPPLER_PATH to the poppler `bin` folder."
            ),
        )

    except PDFPageCountError:
        try:
            os.remove(pdf_path)
        except Exception:
            pass
        logger.exception("PDF page count error")
        raise HTTPException(status_code=400, detail="Unable to read PDF pages")

    except PDFSyntaxError:
        try:
            os.remove(pdf_path)
        except Exception:
            pass
        logger.exception("PDF syntax error")
        raise HTTPException(status_code=400, detail="Invalid PDF file")

    except PDFPopplerTimeoutError:
        try:
            os.remove(pdf_path)
        except Exception:
            pass
        logger.exception("PDF poppler timeout")
        raise HTTPException(status_code=500, detail="PDF conversion timed out")

    except Exception as e:
        try:
            os.remove(pdf_path)
        except Exception:
            pass
        logger.exception("Unexpected conversion error: %s", e)
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")


@router.get("/download/{filename}")
async def download_image(filename: str):
    # Prevent path traversal
    safe_name = os.path.basename(filename)
    try:
        file_path = _safe_join(CONVERTED_DIR, safe_name)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid filename")

    if not os.path.exists(file_path):
        logger.warning("Requested file not found: %s", file_path)
        raise HTTPException(status_code=404, detail="File not found")

    ext = safe_name.split(".")[-1].lower()
    media_types = {"png": "image/png", "jpg": "image/jpeg", "jpeg": "image/jpeg"}

    logger.info("Serving file %s", file_path)

    return FileResponse(path=file_path, filename=safe_name, media_type=media_types.get(ext, "application/octet-stream"))