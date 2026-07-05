from openai import OpenAI
from LLMconfig import API_KEY
import json

client = OpenAI(api_key=API_KEY)

import openai
print(openai.__file__)
print(openai.__version__)


def generate_recommendations(student_data):
    """
    student_data example:

    {
        "current_date": "2026-08-01",
        "courses": [
            {
                "code": "MATH101",
                "name": "Calculus",
                "available_hours": 10,
                "previous_study_hours": 5,
                "previous_exam_scores": [72, 80],
                "topics": [
                    "Limits",
                    "Derivatives",
                    "Integrals"
                ],
                "exams": [
                    {
                        "name": "Midterm",
                        "date": "2026-08-15",
                        "topics": [
                            "Limits",
                            "Derivatives"
                        ]
                    }
                ],
                "assignments": [
                    {
                        "name": "Homework 3",
                        "due_date": "2026-08-08"
                    }
                ]
            }
        ]
    }
    """

    prompt = f"""
You are an expert academic advisor.

A student has supplied course information,
exam scores, study history, upcoming exams,
assignments, and available study time.

Your task:

1. Determine how many hours should be spent on each course.
2. Recommend specific topics to study.
3. Prioritize:
   - Upcoming exams
   - Upcoming assignments
   - Weak areas indicated by previous scores
   - Topics appearing on near-term assessments

Return ONLY valid JSON.

Format:

{{
    "courses": [
        {{
            "course_code": "",
            "course_name": "",
            "recommended_hours": 0,
            "recommended_topics": [],
            "reasoning": ""
        }}
    ]
}}

Student Data:

{json.dumps(student_data, indent=2)}
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    raw_output = response.choices[0].message.content

    cleaned_output = raw_output.strip()
    if cleaned_output.startswith("```"):
        lines = cleaned_output.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines[-1].strip() == "```":
            lines = lines[:-1]
        cleaned_output = "\n".join(lines).strip()

    try:
        return json.loads(cleaned_output)

    except json.JSONDecodeError:
        return {
            "error": "Invalid JSON returned by model",
            "raw_response": raw_output
        }


if __name__ == "__main__":

    sample_data = {
        "current_date": "2026-08-01",
        "courses": [
            {
                "code": "MATH101",
                "name": "Calculus",
                "available_hours": 10,
                "previous_study_hours": 4,
                "previous_exam_scores": [72, 68],
                "topics": [
                    "Limits",
                    "Derivatives",
                    "Integrals"
                ],
                "exams": [
                    {
                        "name": "Midterm",
                        "date": "2026-08-15",
                        "topics": [
                            "Limits",
                            "Derivatives"
                        ]
                    }
                ],
                "assignments": []
            }
        ]
    }

    recommendations = generate_recommendations(sample_data)

    print(json.dumps(recommendations, indent=2))