from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
import requests
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_API_KEY")
AUDD_API_KEY = os.getenv("AUDD_API_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Dependency for token auth
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        user = supabase.auth.get_user(credentials.credentials)
        return user.user
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication Endpoints
class SignupData(BaseModel):
    email: str
    password: str

@app.post("/signup")
async def signup(data: SignupData):
    try:
        response = supabase.auth.sign_up({"email": data.email, "password": data.password})
        return {"message": "User created", "session": response.session}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class LoginData(BaseModel):
    email: str
    password: str

@app.post("/login")
async def login(data: LoginData):
    try:
        response = supabase.auth.sign_in_with_password({"email": data.email, "password": data.password})
        return {"access_token": response.session.access_token, "user": response.user}
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@app.post("/logout")
async def logout(user = Depends(get_current_user)):
    supabase.auth.sign_out()
    return {"message": "Logged out"}

# Upload and Detection Endpoint
@app.post("/upload-mix")
async def upload_mix(title: str, file: UploadFile = File(...), user = Depends(get_current_user)):
    logger.info(f"Received upload request: user_id={user.id}, title={title}, filename={file.filename}")
    try:
        if not file.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail="Only audio files allowed")
        if file.size > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large")
        contents = await file.read()
        file_path = f"{user.id}/{file.filename}"
        logger.info(f"Uploading to Supabase: {file_path}")
        supabase.storage.from_("mixes-bucket").upload(file_path, contents)
        file_url = supabase.storage.from_("mixes-bucket").get_public_url(file_path)
        audd_data = {
            "api_token": AUDD_API_KEY,
            "url": file_url,
            "return": "timecode"
        }
        logger.info("Calling AudD API")
        audd_response = requests.post("https://api.audd.io/recognize", data=audd_data)
        if audd_response.status_code != 200:
            logger.error(f"AudD API error: {audd_response.text}")
            raise Exception("AudD API error")
        detected = audd_response.json().get("result", [])
        mix_data = {
            "user_id": user.id,
            "title": title,
            "file_path": file_path,
            "detected_songs": detected
        }
        logger.info("Inserting to Supabase DB")
        supabase.table("mixes").insert(mix_data).execute()
        return {"message": "Mix uploaded and analyzed", "detected_songs": detected}
    except Exception as e:
        logger.error(f"Upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Retrieval Endpoints
@app.get("/mixes")
async def get_mixes(user = Depends(get_current_user)):
    response = supabase.table("mixes").select("*").eq("user_id", user.id).execute()
    return response.data

@app.get("/mixes/{mix_id}")
async def get_mix(mix_id: str, user = Depends(get_current_user)):
    response = supabase.table("mixes").select("*").eq("id", mix_id).eq("user_id", user.id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Mix not found")
    return response.data[0]

@app.get("/feed")
async def get_feed(limit: int = 10, offset: int = 0):
    response = supabase.table("mixes").select("*").range(offset, offset + limit - 1).execute()
    return response.data

@app.get("/test-storage")
async def test_storage():
    try:
        with open("KETTAMA - It gets better (Chris Stussy Remix).mp3", "rb") as f:  # Place test.mp3 in /Users/zachs/DJHub
            supabase.storage.from_("mixes-bucket").upload("test/KETTAMA - It gets better (Chris Stussy Remix).mp3", f.read())
        return {"message": "Storage works"}
    except Exception as e:
        logger.error(f"Storage error: {str(e)}")
        return {"error": str(e)}
    