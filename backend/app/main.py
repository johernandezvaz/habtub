from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(
    title="Habtub API",
    description="Backend de Habtub – seguimiento de hábitos",
    version="0.1.0",
)

# Orígenes permitidos: en producción usa la URL real del frontend
origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["health"])
async def health_check():
    """Endpoint de salud para el healthcheck del contenedor."""
    return {"status": "ok", "service": "habtub-backend"}


@app.get("/", tags=["root"])
async def root():
    return {"message": "Habtub API — visita /docs para ver los endpoints"}
