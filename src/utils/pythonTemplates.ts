/**
 * Standalone Python source code templates for the Homework OCR & Solver modules
 * using the official Google GenAI Python SDK (from google import genai).
 */

export const PYTHON_OCR_MODULE = `"""
homework_ocr.py
Optical Character Recognition (OCR) module for homework sheets and textbook problems.
Extracts mathematical notation, equations, diagrams descriptions, and printed/handwritten text.

Installation:
    pip install google-genai pillow python-dotenv

Usage:
    python homework_ocr.py path/to/homework_photo.jpg
"""

import os
import sys
from pathlib import Path
from PIL import Image
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

def extract_homework_text(image_path: str, api_key: str = None) -> str:
    """
    Extracts all text and mathematical notation from an image file.
    
    Args:
        image_path: Path to the image file (jpg, png, webp, etc.)
        api_key: Optional Gemini API key. Defaults to GEMINI_API_KEY env var.
        
    Returns:
        str: Extracted text and mathematical formulas.
    """
    key = api_key or os.getenv("GEMINI_API_KEY")
    if not key:
        raise ValueError("GEMINI_API_KEY is not set. Set it in .env or pass as argument.")

    client = genai.Client(api_key=key)

    if not Path(image_path).exists():
        raise FileNotFoundError(f"Image not found at: {image_path}")

    # Open image with PIL
    img = Image.open(image_path)

    prompt = (
        "Perform high-precision Optical Character Recognition (OCR) on this homework image.\\n"
        "Extract ALL text, printed or handwritten, exactly as written.\\n"
        "Transcribe mathematical formulas clearly (e.g. x^2, fractions a/b or \\\\frac{a}{b}, sqrt(), etc.).\\n"
        "Preserve question numbering (1., 2., 3., etc.).\\n"
        "Return ONLY the extracted text."
    )

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[img, prompt],
        config=types.GenerateContentConfig(
            system_instruction=(
                "You are an expert OCR engine for STEM worksheets and handwritten homework. "
                "Output only the extracted text without introductory or conversational filler."
            )
        )
    )

    return response.text.strip() if response.text else ""


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python homework_ocr.py <image_path>")
        sys.exit(1)

    target_image = sys.argv[1]
    print(f"[*] Extracting text from '{target_image}'...")
    try:
        extracted = extract_homework_text(target_image)
        print("\\n--- EXTRACTED HOMEWORK TEXT ---")
        print(extracted)
        print("--------------------------------\\n")
    except Exception as e:
        print(f"[!] Error: {e}")
`;

export const PYTHON_SOLVER_MODULE = `"""
homework_solver.py
Problem-solving module that accepts a math or science problem string as input
and returns a detailed step-by-step solution, with special focus on Algebra and Calculus.

Installation:
    pip install google-genai pydantic python-dotenv

Usage:
    python homework_solver.py "Solve for x: 2x^2 - 7x + 3 = 0"
    python homework_solver.py "Evaluate integral of x * e^(2x) dx"
"""

import os
import sys
import json
from typing import List, Optional
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

class SolutionStep(BaseModel):
    step_number: int = Field(description="Step number (1, 2, 3...)")
    title: str = Field(description="Short descriptive name for this step")
    explanation: str = Field(description="Detailed explanation of the rule or manipulation applied")
    math_formula: Optional[str] = Field(None, description="Mathematical equation or rule for this step")
    result: Optional[str] = Field(None, description="Result after applying this step")

class PracticeProblem(BaseModel):
    question: str
    hint: str
    solution: str

class ProblemSolution(BaseModel):
    problem_title: str
    subject: str
    topic: str
    extracted_problem_text: str
    final_answer: str
    confidence: str
    step_by_step: List[SolutionStep]
    key_concepts: List[str]
    formulas_used: List[str]
    why_it_works: str
    common_pitfalls: List[str]
    practice_problem: PracticeProblem
    graphable_expression: Optional[str] = None


def solve_problem_string(problem_text: str, subject_hint: str = "Math", api_key: str = None) -> ProblemSolution:
    """
    Solves a math or science problem string step-by-step.
    
    Args:
        problem_text: The math or science problem as a string.
        subject_hint: Optional hint (e.g. 'Algebra', 'Calculus', 'Physics').
        api_key: Optional Gemini API key.
        
    Returns:
        ProblemSolution: Structured object containing final answer, steps, and explanations.
    """
    key = api_key or os.getenv("GEMINI_API_KEY")
    if not key:
        raise ValueError("GEMINI_API_KEY is not set. Set it in .env or pass as argument.")

    client = genai.Client(api_key=key)

    system_instruction = (
        "You are an expert STEM tutor and problem-solving engine. "
        "You specialize in common algebra (quadratics, factoring, systems, logarithms) "
        "and calculus (derivatives, product/chain/quotient rules, integrals, substitution, integration by parts). "
        "Provide clear step-by-step pedagogical breakdowns, direct final answers, and intuitive conceptual explanations."
    )

    prompt = f"Solve this {subject_hint} problem step-by-step:\\n\\"{problem_text}\\""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            response_mime_type="application/json",
            response_schema=ProblemSolution,
        ),
    )

    data = json.loads(response.text)
    return ProblemSolution(**data)


if __name__ == "__main__":
    test_problem = (
        sys.argv[1] if len(sys.argv) > 1
        else "Find the derivative of f(x) = x^3 * sin(2x) and evaluate at x = pi"
    )

    print(f"[*] Solving problem: '{test_problem}'...\\n")
    try:
        solution = solve_problem_string(test_problem)
        print(f"=== {solution.problem_title} ({solution.subject} · {solution.topic}) ===")
        print(f"\\n🎯 FINAL ANSWER:\\n   {solution.final_answer}\\n")
        print("📝 STEP-BY-STEP BREAKDOWN:")
        for step in solution.step_by_step:
            print(f"  Step {step.step_number}: {step.title}")
            print(f"    Explanation: {step.explanation}")
            if step.math_formula:
                print(f"    Formula:     {step.math_formula}")
            if step.result:
                print(f"    Result:      {step.result}")
            print()
        print(f"💡 WHY THIS WORKS:\\n   {solution.why_it_works}\\n")
        print("⚠️  COMMON PITFALLS:")
        for pitfall in solution.common_pitfalls:
            print(f"   • {pitfall}")
        print("\\n🏋️ PRACTICE PROBLEM:")
        print(f"   Q:    {solution.practice_problem.question}")
        print(f"   Hint: {solution.practice_problem.hint}")
        print(f"   Ans:  {solution.practice_problem.solution}\\n")
    except Exception as e:
        print(f"[!] Error: {e}")
`;

export const PYTHON_COMBINED_APP = `"""
gauth_homework_app.py
Complete End-to-End Homework Solver (Photo OCR + Step-by-Step Solver)
Works just like Gauth / Photomath!

Takes a photo of your homework, extracts the problem text via OCR,
and returns the full step-by-step solution.

Installation:
    pip install google-genai pillow pydantic python-dotenv

Run:
    python gauth_homework_app.py my_homework.jpg
"""

import os
import sys
from homework_ocr import extract_homework_text
from homework_solver import solve_problem_string

def main():
    if len(sys.argv) < 2:
        print("SnapSolve / Gauth Python CLI")
        print("Usage: python gauth_homework_app.py <path_to_homework_image>")
        sys.exit(1)

    img_path = sys.argv[1]
    print(f"\\n📸 [1/2] Scanning & Running OCR on: {img_path}...")
    try:
        problem_text = extract_homework_text(img_path)
        print("\\n--- Extracted Text ---")
        print(problem_text)
        print("----------------------\\n")

        print("🧠 [2/2] Solving step-by-step with Gemini AI...")
        solution = solve_problem_string(problem_text)

        print("\\n" + "=" * 50)
        print(f"🌟 {solution.problem_title.upper()}")
        print(f"Subject: {solution.subject} · Topic: {solution.topic}")
        print("=" * 50)

        print(f"\\n✅ FINAL ANSWER:\\n   {solution.final_answer}\\n")

        print("📖 STEP-BY-STEP SOLUTION:")
        for s in solution.step_by_step:
            print(f"\\n[Step {s.step_number}] {s.title}")
            print(f"  {s.explanation}")
            if s.math_formula:
                print(f"  Formula: {s.math_formula}")
            if s.result:
                print(f"  => {s.result}")

        print(f"\\n💡 CONCEPT RATIONALE:\\n  {solution.why_it_works}")

        if solution.formulas_used:
            print("\\n📐 FORMULAS USED:")
            for f in solution.formulas_used:
                print(f"  • {f}")

        print("\\n" + "=" * 50 + "\\n")
    except Exception as err:
        print(f"[!] Failed to process homework: {err}")

if __name__ == "__main__":
    main()
`;

export const PYTHON_STREAMLIT_APP = `"""
streamlit_gauth_app.py
Interactive Web Application for Photo Homework Solving (like Gauth)
Built with Streamlit and Google GenAI.

Installation:
    pip install streamlit google-genai pillow pydantic python-dotenv

Run:
    streamlit run streamlit_gauth_app.py
"""

import os
import streamlit as st
from PIL import Image
from dotenv import load_dotenv
from homework_ocr import extract_homework_text
from homework_solver import solve_problem_string

load_dotenv()

st.set_page_config(page_title="SnapSolve AI - Homework Photo Solver", page_icon="🎓", layout="wide")

st.title("🎓 SnapSolve AI - Homework Photo Solver")
st.caption("Take a photo of your homework to extract text and get instant step-by-step solutions!")

col1, col2 = st.columns([1, 1])

with col1:
    st.subheader("1. Snap or Upload Photo")
    input_method = st.radio("Input Method", ["Upload File", "Camera Snap", "Enter Text Manually"], horizontal=True)

    img = None
    problem_text = ""

    if input_method == "Upload File":
        uploaded_file = st.file_uploader("Upload Homework Image", type=["jpg", "jpeg", "png", "webp"])
        if uploaded_file:
            img = Image.open(uploaded_file)
            st.image(img, caption="Uploaded Homework", use_column_width=True)
            # Save temporary
            temp_path = "temp_hw.jpg"
            img.save(temp_path)
            if st.button("🔍 Extract Text (OCR)", type="primary"):
                with st.spinner("Extracting problem text..."):
                    problem_text = extract_homework_text(temp_path)
                    st.session_state["extracted_text"] = problem_text

    elif input_method == "Camera Snap":
        camera_img = st.camera_input("Take photo of notebook / worksheet")
        if camera_img:
            img = Image.open(camera_img)
            temp_path = "temp_hw_cam.jpg"
            img.save(temp_path)
            if st.button("🔍 Extract Text (OCR)", type="primary"):
                with st.spinner("Scanning homework..."):
                    problem_text = extract_homework_text(temp_path)
                    st.session_state["extracted_text"] = problem_text

    else:
        manual_text = st.text_area(
            "Type or paste math/science problem:",
            value="Solve the quadratic equation: 3x^2 - 11x - 4 = 0",
            height=120
        )
        if st.button("Solve Problem", type="primary"):
            st.session_state["extracted_text"] = manual_text

    # Show editable extracted text
    if "extracted_text" in st.session_state:
        st.subheader("2. Problem Text (OCR Result)")
        edited_text = st.text_area("Review or edit extracted problem:", value=st.session_state["extracted_text"], height=100)
        st.session_state["extracted_text"] = edited_text

with col2:
    st.subheader("3. Step-by-Step Solution")
    if "extracted_text" in st.session_state and st.session_state["extracted_text"].strip():
        if st.button("🚀 Solve This Problem", type="primary", use_container_width=True):
            with st.spinner("Solving step-by-step..."):
                try:
                    sol = solve_problem_string(st.session_state["extracted_text"])
                    st.success(f"Final Answer: {sol.final_answer}")
                    
                    st.markdown(f"### {sol.problem_title}")
                    st.write(f"**Subject:** {sol.subject} | **Topic:** {sol.topic}")

                    st.markdown("#### Steps:")
                    for step in sol.step_by_step:
                        with st.expander(f"Step {step.step_number}: {step.title}", expanded=True):
                            st.write(step.explanation)
                            if step.math_formula:
                                st.latex(step.math_formula)
                            if step.result:
                                st.info(f"Result: {step.result}")

                    st.markdown("#### 💡 Why This Works:")
                    st.write(sol.why_it_works)

                    st.markdown("#### ⚠️ Common Pitfalls:")
                    for pit in sol.common_pitfalls:
                        st.warning(pit)

                except Exception as e:
                    st.error(f"Error solving: {e}")
    else:
        st.info("Take a photo, upload an image, or type a problem on the left to see the solution.")
`;
