import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Increase payload limit for homework images
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Dedicated OCR Endpoint: Extracts all text and mathematical notation from image
app.post('/api/ocr', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required for OCR' });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured. Please check your environment variables.',
      });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanBase64,
            },
          },
          {
            text: `Perform high-precision Optical Character Recognition (OCR) on this homework image.
Extract ALL text, printed or handwritten, exactly as written.
For mathematical expressions and equations, transcribe them into clear standard mathematical notation (use clear standard symbols like ^ for exponents, fractions as a/b or LaTeX \\frac{a}{b}, sqrt() for radicals, and Greek letters like theta, alpha).
If there are multiple numbered problems (e.g. 1., 2., 3.), preserve their numbering and labels.
Return ONLY the raw extracted text without any conversational preamble or meta-commentary.`,
          },
        ],
      },
      config: {
        systemInstruction: 'You are an advanced optical character recognition (OCR) engine specialized in STEM, mathematics, science worksheets, handwriting, and textbook typography. Return only the extracted text faithfully.',
      },
    });

    const extractedText = (response.text || '').trim();
    return res.json({
      success: true,
      extractedText,
      length: extractedText.length,
    });
  } catch (error: any) {
    console.error('Error during OCR text extraction:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to extract text from image.',
    });
  }
});

// Dedicated Problem-Solving Module Endpoint: Accepts a string of a math or science problem
app.post('/api/solve-text', async (req: Request, res: Response) => {
  try {
    const { problemText, subjectHint = 'Auto-detect' } = req.body;

    if (!problemText || typeof problemText !== 'string' || !problemText.trim()) {
      return res.status(400).json({ error: 'Problem text string is required' });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured.',
      });
    }

    const systemInstruction = `You are SnapSolve AI's core mathematical and scientific problem-solving engine.
You specialize deeply in common algebra (factoring, quadratics, linear systems, exponentials, logarithms) and calculus (limits, derivatives, product/quotient/chain rules, implicit differentiation, Riemann sums, integration, substitution, integration by parts, applications of extrema), as well as general physics and chemistry.

Rules:
1. Provide a rigorous, crystal-clear step-by-step pedagogical solution.
2. Formulate the direct final answer cleanly and unambiguously.
3. For each step: state the rule/technique used, show the intermediate math manipulation, and state the interim result.
4. Highlight key formulas and theorems applied (e.g., "d/dx[u*v] = u'*v + u*v'", "\\int u dv = u*v - \\int v du", "x = (-b \\pm \\sqrt{b^2 - 4ac})/(2a)").
5. Explain the intuitive "Why it works" logic so students learn conceptually.
6. Provide common pitfalls students should watch out for.
7. Provide one similar practice problem with a hint and solution.
8. If the function is plot-able on a 2D Cartesian plane (algebra/calculus), provide a clean graphable JS expression in terms of x (e.g., "x*x - 4*x + 3" or "3*x*x - 5*x - 2" or "Math.cos(x)").`;

    const prompt = `Solve the following math/science problem step-by-step:
"${problemText}"
Subject hint: ${subjectHint}
Provide output strictly adhering to the JSON schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            problemTitle: { type: Type.STRING, description: 'Short descriptive title of problem' },
            subject: { type: Type.STRING, description: 'Subject: Algebra, Calculus, Geometry, Physics, Chemistry, etc.' },
            topic: { type: Type.STRING, description: 'Specific topic: e.g., Integration by Parts, Quadratic Equations, Limits at Infinity' },
            extractedProblemText: { type: Type.STRING, description: 'Clean formatted version of the problem string' },
            finalAnswer: { type: Type.STRING, description: 'Direct, clear final answer' },
            confidence: { type: Type.STRING, description: 'Confidence level: High, Medium, Low' },
            stepByStep: {
              type: Type.ARRAY,
              description: 'Step-by-step solution steps',
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  mathFormula: { type: Type.STRING },
                  result: { type: Type.STRING },
                },
                required: ['stepNumber', 'title', 'explanation'],
              },
            },
            keyConcepts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Fundamental concepts applied',
            },
            formulasUsed: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Formulas, identities, or derivative/integral rules used',
            },
            whyItWorks: { type: Type.STRING, description: 'Intuitive rationale and conceptual explanation' },
            commonPitfalls: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Common traps or student mistakes to avoid',
            },
            practiceProblem: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                hint: { type: Type.STRING },
                solution: { type: Type.STRING },
              },
              required: ['question', 'hint', 'solution'],
            },
            graphableExpression: {
              type: Type.STRING,
              description: 'JavaScript math expression of x for plotting (or empty string)',
            },
          },
          required: [
            'problemTitle',
            'subject',
            'topic',
            'extractedProblemText',
            'finalAnswer',
            'stepByStep',
            'keyConcepts',
            'formulasUsed',
            'whyItWorks',
            'practiceProblem',
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Model returned empty response');
    }

    const data = JSON.parse(text);
    return res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error in solve-text:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to solve problem text.',
    });
  }
});
app.post('/api/solve', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', subjectHint, customNote } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured. Please check your environment variables.',
      });
    }

    // Strip data URL header if present
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const systemInstruction = `You are SnapSolve AI, an expert, encouraging homework tutor and solver built for students across high school and university levels (similar to Gauth, Photomath, and Chegg).
Your task is to analyze the student's homework photo with high precision and provide a complete, clear, pedagogical solution.
Rules:
1. Carefully transcribe the exact question text, equations, and diagrams.
2. Determine the subject (e.g. Mathematics, Physics, Chemistry, Biology, Computer Science, Literature, History, Economics).
3. Identify the main concept and topic.
4. Give a crystal-clear, direct final answer first so the student knows immediately.
5. Provide step-by-step breakdown where each step is clear, logical, and explains the "why".
6. Include relevant mathematical formulas or scientific laws.
7. Note common student pitfalls and mistakes to watch out for.
8. Create one similar practice question with hint and solution so the student can master the concept.
9. If the problem can be visualized on a 2D Cartesian graph (e.g. quadratic curve, linear equation, derivative, trigonometric wave), provide a graphable JavaScript math expression (e.g. "x*x - 4*x + 3" or "2*x + 1").
10. Ensure the explanation is empathetic, engaging, and easy to follow.`;

    const promptText = `Please solve this homework question from the uploaded image.
${subjectHint ? `Subject hint: ${subjectHint}.` : ''}
${customNote ? `Student's specific question / note: "${customNote}".` : ''}
Return your response strictly adhering to the requested JSON structure.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanBase64,
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            problemTitle: { type: Type.STRING, description: 'Short descriptive title of problem' },
            subject: { type: Type.STRING, description: 'Academic subject e.g. Mathematics, Physics, Chemistry, Biology, History, English' },
            topic: { type: Type.STRING, description: 'Specific sub-topic e.g. Quadratic Formula, Photosynthesis, Thermodynamics' },
            extractedProblemText: { type: Type.STRING, description: 'Full readable text/transcription of the problem' },
            finalAnswer: { type: Type.STRING, description: 'Direct final answer clearly stated' },
            confidence: { type: Type.STRING, description: 'Confidence level: High, Medium, or Low' },
            stepByStep: {
              type: Type.ARRAY,
              description: 'Step-by-step pedagogical solution steps',
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  mathFormula: { type: Type.STRING },
                  result: { type: Type.STRING },
                },
                required: ['stepNumber', 'title', 'explanation'],
              },
            },
            keyConcepts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Key principles or rules used',
            },
            formulasUsed: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Formulas and theorems',
            },
            whyItWorks: { type: Type.STRING, description: 'Intuitive 2-3 sentence explanation of the underlying logic' },
            commonPitfalls: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Common traps students fall into for this type of problem',
            },
            practiceProblem: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                hint: { type: Type.STRING },
                solution: { type: Type.STRING },
              },
              required: ['question', 'hint', 'solution'],
            },
            graphableExpression: {
              type: Type.STRING,
              description: 'Optional mathematical expression in terms of x suitable for plotting (e.g. "Math.sin(x)" or "x*x - 4"), or empty string if not applicable',
            },
          },
          required: [
            'problemTitle',
            'subject',
            'topic',
            'extractedProblemText',
            'finalAnswer',
            'stepByStep',
            'keyConcepts',
            'formulasUsed',
            'whyItWorks',
            'practiceProblem',
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Model returned empty response');
    }

    const parsedData = JSON.parse(text);
    return res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Error solving homework problem:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to solve homework problem. Please try again.',
    });
  }
});

// Follow-up Tutor Q&A Chat Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { problemContext, messageHistory, userMessage } = req.body;

    if (!userMessage) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemInstruction = `You are SnapSolve AI's personal 1-on-1 homework tutor.
You are helping a student understand their homework solution.
Original Problem Context:
${problemContext ? JSON.stringify(problemContext, null, 2) : 'No prior context'}

Guidelines:
- Explain things warmly, patiently, and clearly at the student's level.
- Break down any specific step the student is struggling with.
- Provide alternative ways of solving or thinking about the problem if asked.
- Keep responses focused, encouraging, and easy to read.`;

    const contents = [];
    if (Array.isArray(messageHistory)) {
      for (const msg of messageHistory) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        });
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
      },
    });

    return res.json({ success: true, text: response.text });
  } catch (error: any) {
    console.error('Error in tutor chat:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to get tutor response.',
    });
  }
});

// Dedicated Python Code Generation Endpoint
app.post('/api/generate-python', async (req: Request, res: Response) => {
  try {
    const { problemTitle, subject, extractedText, mode = 'full-app' } = req.body;

    const systemInstruction = `You are an expert Python developer creating educational tools.
Generate clean, production-grade, well-commented Python code for a homework photo solver using the official Google GenAI Python SDK (from google import genai).`;

    const prompt = `Write a standalone Python script (${mode}) that solves homework problems from photos using the Gemini API.
Problem details (if applicable):
- Title: ${problemTitle || 'General Homework Problem'}
- Subject: ${subject || 'STEM / Math'}
- Text/Equation: ${extractedText || 'Photo-based input'}

Requirements:
1. Use modern 'from google import genai' library syntax.
2. Load GEMINI_API_KEY from environment or .env file (using python-dotenv).
3. Include clear instructions in the docstring on how to install dependencies ('pip install google-genai pillow python-dotenv').
4. If mode is 'cli', make it a clean command-line script taking an image path and printing the formatted step-by-step breakdown.
5. If mode is 'gui', provide a clean Tkinter desktop app where users can click 'Open Image' and see the solution.
6. If mode is 'streamlit', create an interactive web app with file upload, camera snap, and interactive expanders for steps.
Return ONLY valid Python code without Markdown backticks if possible, or wrapped cleanly.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    let code = response.text || '';
    // Strip markdown code fences if present
    code = code.replace(/^```python\s*/i, '').replace(/^```\s*/, '').replace(/```$/g, '').trim();

    return res.json({ success: true, pythonCode: code });
  } catch (error: any) {
    console.error('Error generating python script:', error);
    return res.status(500).json({ error: error?.message || 'Failed to generate Python code' });
  }
});

// Setup Vite or static serving
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`SnapSolve AI server running at http://localhost:${PORT} in ${isDev ? 'dev' : 'prod'} mode`);
  });
}

startServer();
