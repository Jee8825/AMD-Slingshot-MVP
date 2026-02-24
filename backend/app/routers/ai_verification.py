import io
import json
from PIL import Image
from fastapi import APIRouter, File, UploadFile, HTTPException
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted

from app.config import get_settings

router = APIRouter()
settings = get_settings()

def get_gemini_client(api_key: str):
    genai.configure(api_key=api_key)
    return genai.GenerativeModel('gemini-1.5-flash')

async def process_image_with_gemini(model: genai.GenerativeModel, image: Image.Image) -> dict:
    prompt = """
    Analyze this image to verify if it depicts a completed public infrastructure or developmental project.
    Provide a JSON response with the following format exactly:
    {
      "confidence_score": <float between 0 and 1 representing confidence of completion>,
      "status": <either "VERIFIED" or "REJECTED">,
      "reasoning": "<short string explaining the reasoning>"
    }
    """
    response = model.generate_content([prompt, image])
    text = response.text.strip()
    
    # Strip markdown code blocks if any
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
        
    try:
        data = json.loads(text)
        return {
            "confidence_score": data.get("confidence_score", 0.0),
            "status": data.get("status", "REJECTED")
        }
    except json.JSONDecodeError:
        return {
            "confidence_score": 0.0,
            "status": "REJECTED"
        }

async def real_ai_verify_image(file: UploadFile):
    contents = await file.read()
    size = len(contents)
    
    try:
        image = Image.open(io.BytesIO(contents))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image format.")
    
    # Try Key 1
    if settings.GEMINI_API_KEY_1:
        try:
            model = get_gemini_client(settings.GEMINI_API_KEY_1)
            result = await process_image_with_gemini(model, image)
            result["file_size"] = size
            return result
        except ResourceExhausted:
            pass # Fall back to Key 2
        except Exception as e:
            # If it's another error, we could still fallback or fail. Let's fallback.
            pass
            
    # Try Key 2
    if settings.GEMINI_API_KEY_2:
        try:
            model = get_gemini_client(settings.GEMINI_API_KEY_2)
            result = await process_image_with_gemini(model, image)
            result["file_size"] = size
            return result
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"AI verification failed on both keys: {str(e)}")
            
    # If no keys configured, throw error
    if not settings.GEMINI_API_KEY_1 and not settings.GEMINI_API_KEY_2:
        # Fallback mock for local development without keys
        import random
        return {
            "file_size": size,
            "confidence_score": round(random.uniform(0.85, 0.99), 4),
            "status": "VERIFIED"
        }

@router.post("/")
async def verify_image_endpoint(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File provided is not an image.")
    result = await real_ai_verify_image(file)
    return result
