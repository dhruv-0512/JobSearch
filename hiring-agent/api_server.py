"""
FastAPI wrapper for the hiring-agent pipeline.

Exposes a single POST /evaluate endpoint that:
  1. Accepts a resume PDF upload
  2. Runs the full hiring-agent pipeline (PDF parse → GitHub → LLM eval)
  3. Returns structured JSON with resume data, GitHub info, and evaluation scores

Run with:
    uvicorn api_server:app --host 0.0.0.0 --port 8000
"""

import os
import sys
import json
import tempfile
import logging
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
# Load environment variables from .env file before anything else
load_dotenv()

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Add hiring-agent dir to path so imports work when run from any cwd
sys.path.insert(0, os.path.dirname(__file__))

from score import main as run_evaluation
from models import EvaluationData, JSONResume

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)5s - %(lineno)5d - %(funcName)33s - %(levelname)5s - %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Hiring Agent API",
    description="Resume evaluation pipeline — PDF → GitHub → AI scoring",
    version="1.0.0",
)

# Allow calls from the Node.js backend (any origin in dev; tighten in prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Liveness probe."""
    return {"status": "ok", "service": "hiring-agent"}


@app.post("/evaluate")
async def evaluate_resume(
    resume: UploadFile = File(..., description="Resume PDF file"),
    github_token: Optional[str] = Form(None, description="Optional GitHub PAT for higher rate limits"),
):
    """
    Run the full hiring-agent evaluation pipeline on the uploaded resume PDF.

    Returns a rich JSON object with:
    - resume_data: parsed basics, work, education, skills, projects
    - github_data: profile info + top projects
    - evaluation: category scores, bonus, deductions, strengths, improvements
    - overall_score: computed total
    """
    if not resume.filename or not resume.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    # Temporarily set GITHUB_TOKEN if provided
    original_github_token = os.environ.get("GITHUB_TOKEN")
    if github_token:
        os.environ["GITHUB_TOKEN"] = github_token

    tmp_path = None
    try:
        # Write uploaded PDF to a temp file
        suffix = Path(resume.filename).suffix or ".pdf"
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            content = await resume.read()
            tmp.write(content)
            tmp_path = tmp.name

        logger.info(f"📄 Evaluating resume: {resume.filename} ({len(content)} bytes)")

        # Run the full pipeline — this can take 30-120s depending on GitHub size
        result = run_evaluation(tmp_path)

        if result is None:
            raise HTTPException(
                status_code=422,
                detail="Could not parse the resume PDF. Ensure it contains readable text.",
            )

        # Serialize the EvaluationData pydantic model to dict
        evaluation_dict = result.model_dump() if hasattr(result, "model_dump") else {}

        return JSONResponse(
            status_code=200,
            content={
                "status": "ok",
                "filename": resume.filename,
                "evaluation": evaluation_dict,
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"❌ Evaluation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Evaluation error: {str(e)}")
    finally:
        # Clean up temp file
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except OSError:
                pass

        # Restore original GITHUB_TOKEN
        if github_token:
            if original_github_token is not None:
                os.environ["GITHUB_TOKEN"] = original_github_token
            else:
                os.environ.pop("GITHUB_TOKEN", None)


@app.post("/evaluate/full")
async def evaluate_resume_full(
    resume: UploadFile = File(..., description="Resume PDF file"),
    github_token: Optional[str] = Form(None),
):
    """
    Same as /evaluate but also returns the raw parsed resume JSON and GitHub data
    for maximum detail in the frontend.
    """
    if not resume.filename or not resume.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    original_github_token = os.environ.get("GITHUB_TOKEN")
    if github_token:
        os.environ["GITHUB_TOKEN"] = github_token

    tmp_path = None
    try:
        suffix = Path(resume.filename).suffix or ".pdf"
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            content = await resume.read()
            tmp.write(content)
            tmp_path = tmp.name

        logger.info(f"📄 Full evaluation: {resume.filename} ({len(content)} bytes)")

        # Import internals to capture intermediate results
        import json as _json
        from pdf import PDFHandler
        from github import fetch_and_display_github_info
        from score import find_profile, _evaluate_resume
        from transform import (
            convert_json_resume_to_text,
            convert_github_data_to_text,
        )
        from config import DEVELOPMENT_MODE
        from prompt import DEFAULT_MODEL, MODEL_PARAMETERS
        from pathlib import Path as _Path

        # Step 1: Parse PDF
        pdf_handler = PDFHandler()
        resume_data = pdf_handler.extract_json_from_pdf(tmp_path)
        if resume_data is None:
            raise HTTPException(status_code=422, detail="Could not parse the resume PDF.")

        # Step 2: Fetch GitHub
        github_data = {}
        profiles = []
        if resume_data and hasattr(resume_data, "basics") and resume_data.basics:
            profiles = resume_data.basics.profiles or []
        github_profile = find_profile(profiles, "Github")
        if github_profile:
            github_data = fetch_and_display_github_info(github_profile.url)

        # Step 3: Evaluate
        evaluation = _evaluate_resume(resume_data, github_data)
        if evaluation is None:
            raise HTTPException(status_code=500, detail="Evaluation returned no result.")

        # Step 4: Compute overall score
        total_score = 0
        max_score = 0
        if hasattr(evaluation, "scores") and evaluation.scores:
            for cat_name, cat_data in evaluation.scores.model_dump().items():
                capped = min(cat_data["score"], cat_data["max"])
                total_score += capped
                max_score += cat_data["max"]
        if hasattr(evaluation, "bonus_points") and evaluation.bonus_points:
            total_score += evaluation.bonus_points.total
        if hasattr(evaluation, "deductions") and evaluation.deductions:
            total_score -= evaluation.deductions.total

        return JSONResponse(
            status_code=200,
            content={
                "status": "ok",
                "filename": resume.filename,
                "resume_data": _json.loads(resume_data.model_dump_json()),
                "github_data": github_data,
                "evaluation": _json.loads(evaluation.model_dump_json()),
                "overall_score": round(total_score, 1),
                "max_score": max_score,
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"❌ Full evaluation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Evaluation error: {str(e)}")
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except OSError:
                pass
        if github_token:
            if original_github_token is not None:
                os.environ["GITHUB_TOKEN"] = original_github_token
            else:
                os.environ.pop("GITHUB_TOKEN", None)


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8008))
    uvicorn.run("api_server:app", host="0.0.0.0", port=port, reload=False)
