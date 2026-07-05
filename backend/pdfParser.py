from openai import OpenAI
from pypdf import PdfReader
from LLMconfig import API_KEY
import json

client = OpenAI(api_key=API_KEY)


def extract_pdf_text(pdf_path: str) -> str:
    """Extract all text from a PDF."""
    reader = PdfReader(pdf_path)

    text = []

    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text.append(page_text)

    return "\n".join(text)


def parse_syllabus(pdf_path: str) -> dict:
    """Parse a syllabus PDF into structured JSON."""

    pdf_text = extract_pdf_text(pdf_path)

    prompt = f"""
You are an academic planning assistant.

Extract the following information from this syllabus.
Be as complete as possible, do not exclude any topics listed.

Return ONLY valid JSON.

Schema:
{{
  "course_name": "",
  "exam_dates": [
    {{
      "name": "",
      "date": "",
      "topics": []
    }}
  ],
  "assignments": [
    {{
      "name": "",
      "due_date": ""
    }}
  ],
  "topics": []
}}

SYLLABUS:

{pdf_text}
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    content = response.choices[0].message.content

    cleaned_content = content.strip()
    if cleaned_content.startswith("```"):
        lines = cleaned_content.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines[-1].strip() == "```":
            lines = lines[:-1]
        cleaned_content = "\n".join(lines).strip()

    try:
        return json.loads(cleaned_content)
    except json.JSONDecodeError:
        return {
            "error": "Model did not return valid JSON",
            "raw_response": content
        }


if __name__ == "__main__":
    result = parse_syllabus("CalculusSyllabus.pdf")

    print(json.dumps(result, indent=2))