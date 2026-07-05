from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import json
import os

from PDFParser import parse_syllabus
from Recommender import generate_recommendations

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/api/courses/register")
async def register_course(
    code: str = Form(...),
    name: str = Form(...),
    availableHours: float = Form(...),
    targetGrade: float = Form(...),
    startDate: str = Form(...),
    prevStudyHours: float = Form(...),
    prevExamScore: float = Form(...),
    syllabus: UploadFile = File(...)
):
    pdf_path = os.path.join(
    UPLOAD_DIR,
    syllabus.filename
)

    with open(pdf_path, "wb") as f:
        f.write(await syllabus.read())
        
    syllabus_data = parse_syllabus(pdf_path)
        
    student_data = {
    "current_date": startDate,
    "courses": [
        {
            "code": code,
            "name": name,
            "available_hours": availableHours,
            "previous_study_hours": prevStudyHours,
            "previous_exam_scores": [prevExamScore],
            "topics": syllabus_data["topics"],
            "exams": syllabus_data["exams"],
            "assignments": syllabus_data.get(
                "assignments",
                []
            )
        }
        ]
    }
    
    recommendations = generate_recommendations(student_data)
    
    return {
    "course": {
        "code": code,
        "name": name,
        "targetGrade": targetGrade,
        "availableHours": availableHours
    },
    "syllabus": syllabus_data,
    "recommendations": recommendations
}