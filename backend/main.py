from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.image_to_pdf import router as image_to_pdf_router
from routers.pdf_to_image import router as pdf_to_image_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(image_to_pdf_router)
app.include_router(pdf_to_image_router)