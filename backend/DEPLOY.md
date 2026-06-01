Render deployment notes for backend

1. Poppler

- Render Linux images require installing poppler-utils before starting the app.
- In `render.yaml` buildCommand you can install poppler:

  apt-get update && apt-get install -y poppler-utils

- Alternatively, set `POPPLER_PATH` to the directory containing `pdfinfo` and `pdftoppm` binaries.

2. Environment variables

- `POPPLER_PATH` (optional): path to poppler `bin` folder when not installed system-wide.
- `S3_BUCKET` (optional): if set, converted images will be uploaded to this S3 bucket and the API will return presigned URLs.
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` (required if using S3)

3. Requirements

- `backend/requirements.txt` contains the Python dependencies including `boto3` for S3 support.
- Ensure your Render service uses the correct Python runtime (e.g., python 3.11)

4. Filesystem notes

- Render instances have ephemeral filesystems. Do not rely on local files to persist across requests or instances.
- For multi-instance stability, enable S3 by setting `S3_BUCKET` and AWS credentials.

5. Example render.yaml (build & start steps)

services:
  - type: web
    name: file-converter-backend
    env: python

    buildCommand: |
      apt-get update && apt-get install -y poppler-utils
      pip install -r requirements.txt

    startCommand: "uvicorn main:app --host 0.0.0.0 --port 10000"

6. Debugging

- Check logs for `Poppler not detected` messages. If seen, verify `poppler-utils` installation or set `POPPLER_PATH`.
- For file access issues, ensure your frontend uses the returned `download_url` from the API. If using S3, URLs will be absolute presigned links.

*** End of notes
