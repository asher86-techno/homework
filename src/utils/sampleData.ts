export interface SampleProblem {
  id: string;
  title: string;
  subject: 'Algebra' | 'Calculus' | 'Physics' | 'Chemistry' | 'Geometry';
  difficulty: 'High School' | 'AP / College';
  text: string;
  imageSvgDataUrl: string;
}

function createLinedPaperSvg(subject: string, title: string, problemText: string, mathLines: string[]): string {
  const linesSvg = Array.from({ length: 8 })
    .map((_, i) => `<line x1="20" y1="${80 + i * 28}" x2="480" y2="${80 + i * 28}" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="2,2"/>`)
    .join('');

  const mathSvgLines = mathLines
    .map((line, idx) => `<text x="50" y="${110 + idx * 32}" font-family="'Courier New', monospace" font-size="16" font-weight="bold" fill="#0f172a">${line}</text>`)
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="320" viewBox="0 0 500 320">
    <defs>
      <linearGradient id="paper" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fffef7"/>
        <stop offset="100%" stop-color="#f8fafc"/>
      </linearGradient>
    </defs>
    <!-- Paper base -->
    <rect width="500" height="320" rx="12" fill="url(#paper)" stroke="#e2e8f0" stroke-width="2"/>
    <!-- Left red notebook margin -->
    <line x1="38" y1="0" x2="38" y2="320" stroke="#fca5a5" stroke-width="1.5"/>
    <line x1="41" y1="0" x2="41" y2="320" stroke="#fecaca" stroke-width="1"/>
    
    <!-- Lined rows -->
    ${linesSvg}
    
    <!-- Header -->
    <text x="50" y="45" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="600" fill="#64748b" letter-spacing="1">HOMEWORK · ${subject.toUpperCase()}</text>
    <text x="50" y="68" font-family="'Plus Jakarta Sans', sans-serif" font-size="15" font-weight="700" fill="#1e293b">${title}</text>
    
    <!-- Problem text and math notation -->
    ${mathSvgLines}
    
    <!-- Bottom timestamp & student stamp -->
    <text x="50" y="295" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" fill="#94a3b8">SnapSolve Notebook Sample · Ready to scan</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_PROBLEMS: SampleProblem[] = [
  {
    id: 'algebra-quadratic',
    title: 'Solve Quadratic Equation by Factoring & Formula',
    subject: 'Algebra',
    difficulty: 'High School',
    text: 'Solve for x: 3x^2 - 11x - 4 = 0. Show all steps using both factoring and the quadratic formula.',
    imageSvgDataUrl: createLinedPaperSvg(
      'Algebra',
      'Problem 1: Quadratic Equations',
      'Solve for x:',
      [
        'Solve for x:',
        '3x² - 11x - 4 = 0',
        'Find all real solutions.',
        'Show steps for factoring & formula.'
      ]
    ),
  },
  {
    id: 'calculus-integration',
    title: 'Integration by Parts: ∫ x · cos(2x) dx',
    subject: 'Calculus',
    difficulty: 'AP / College',
    text: 'Evaluate the indefinite integral: ∫ x * cos(2x) dx using integration by parts (LIATE rule).',
    imageSvgDataUrl: createLinedPaperSvg(
      'Calculus',
      'Problem 2: Techniques of Integration',
      'Evaluate the integral:',
      [
        'Evaluate the integral:',
        '∫ x · cos(2x) dx',
        'Use integration by parts: ∫u dv = uv - ∫v du',
        'Show choice of u and dv.'
      ]
    ),
  },
  {
    id: 'calculus-derivative-chain',
    title: 'Chain Rule & Logarithmic Derivative',
    subject: 'Calculus',
    difficulty: 'AP / College',
    text: 'Find the derivative f\'(x) for f(x) = ln(3x^2 + 5x + 1) and calculate the slope of the tangent at x = 1.',
    imageSvgDataUrl: createLinedPaperSvg(
      'Calculus',
      'Problem 3: Differentiation Chain Rule',
      'Find f\'(x):',
      [
        'Given: f(x) = ln(3x² + 5x + 1)',
        '1) Find the derivative f\'(x).',
        '2) Evaluate f\'(1) to find tangent slope.'
      ]
    ),
  },
  {
    id: 'physics-projectile',
    title: 'Kinematics: 2D Projectile Trajectory',
    subject: 'Physics',
    difficulty: 'High School',
    text: 'A ball is kicked from ground level with initial velocity v0 = 20 m/s at an angle θ = 30° above horizontal. (g = 9.8 m/s²). Find: (a) Time of flight, (b) Maximum height reached, and (c) Horizontal range.',
    imageSvgDataUrl: createLinedPaperSvg(
      'Physics',
      'Problem 4: 2D Projectile Motion',
      'Ball kicked at θ = 30° with v0 = 20 m/s',
      [
        'Initial velocity v₀ = 20 m/s at θ = 30°',
        'g = 9.8 m/s²',
        'Find: (a) Total time of flight',
        '      (b) Max height H',
        '      (c) Horizontal range R'
      ]
    ),
  },
  {
    id: 'chemistry-stoichiometry',
    title: 'Stoichiometry & Molar Mass Conversion',
    subject: 'Chemistry',
    difficulty: 'High School',
    text: 'Given the reaction: 2 C2H6 + 7 O2 -> 4 CO2 + 6 H2O. If 15.0 g of ethane (C2H6) reacts completely with excess oxygen, calculate the mass of CO2 produced in grams. (Molar masses: C=12.01, H=1.008, O=16.00 g/mol).',
    imageSvgDataUrl: createLinedPaperSvg(
      'Chemistry',
      'Problem 5: Stoichiometry & Mass Relations',
      'Combustion of Ethane',
      [
        '2 C₂H₆ + 7 O₂ → 4 CO₂ + 6 H₂O',
        'Given 15.0 grams of C₂H₆ with excess O₂',
        'Calculate grams of CO₂ produced.',
        'Molar masses: C=12.01, H=1.01, O=16.00'
      ]
    ),
  },
];
