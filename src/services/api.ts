import { HomeworkSolution, ChatMessage } from '../types/homework';

export async function extractTextFromImage(
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<string> {
  const res = await fetch('/api/ocr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `OCR error (${res.status})`);
  }

  const json = await res.json();
  return json.extractedText || '';
}

export async function solveProblemString(
  problemText: string,
  subjectHint: string = 'Auto-detect'
): Promise<HomeworkSolution> {
  const res = await fetch('/api/solve-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problemText, subjectHint }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Solver error (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

export async function solveHomeworkImage(
  imageBase64: string,
  mimeType: string = 'image/jpeg',
  subjectHint?: string,
  customNote?: string
): Promise<HomeworkSolution> {
  const res = await fetch('/api/solve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType, subjectHint, customNote }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to solve image (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

export async function sendTutorMessage(
  problemContext: HomeworkSolution | null,
  messageHistory: ChatMessage[],
  userMessage: string
): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      problemContext,
      messageHistory,
      userMessage,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Tutor error (${res.status})`);
  }

  const json = await res.json();
  return json.text || '';
}

export async function generateCustomPythonScript(
  problemTitle: string,
  subject: string,
  extractedText: string,
  mode: 'cli' | 'gui' | 'streamlit' = 'cli'
): Promise<string> {
  const res = await fetch('/api/generate-python', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problemTitle, subject, extractedText, mode }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Python generation error (${res.status})`);
  }

  const json = await res.json();
  return json.pythonCode || '';
}
