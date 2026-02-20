from fastapi import APIRouter, File, UploadFile, HTTPException
import random

router = APIRouter()

async def mock_ai_verify_image(file: UploadFile):
    # Read file size to simulate processing
    contents = await file.read()
    size = len(contents)
    
    # Generate random confidence
    confidence_score = random.uniform(0.85, 0.99)
    
    return {
        "file_size": size,
        "confidence_score": round(confidence_score, 4),
        "status": "VERIFIED"
    }

@router.post("/")
async def verify_image_endpoint(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File provided is not an image.")
    result = await mock_ai_verify_image(file)
    return result
