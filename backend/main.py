from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from . import models
from .routers import auth, leaves, approvals, users, admin

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS 미들웨어 추가
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(leaves.router, prefix="/api/leaves", tags=["leaves"])
app.include_router(approvals.router, prefix="/api/approvals", tags=["approvals"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

@app.get("/")
def read_root():
    return {"Hello": "World"}
