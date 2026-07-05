from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import json
import os

from pdfParser import parse_syllabus
from Recommender import generate_recommendations

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import shutil

UPLOAD_DIR = "uploads"

if os.path.exists(UPLOAD_DIR):
    try:
        shutil.rmtree(UPLOAD_DIR)
    except Exception:
        pass
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
            "topics": syllabus_data.get("topics", []),
            "exams": syllabus_data.get("exam_dates", syllabus_data.get("exams", [])),
            "assignments": syllabus_data.get("assignments", [])
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

@app.post("/api/courses/recommend")
async def get_course_recommendation(payload: dict):
    recommendations = generate_recommendations(payload)
    return {"recommendations": recommendations}