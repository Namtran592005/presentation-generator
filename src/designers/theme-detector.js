const FINANCIAL_KEYWORDS = [
  'revenue', 'profit', 'growth', 'fiscal', 'quarter', 'financial', 'earnings',
  'revenue growth', 'net income', 'operating margin', 'ebitda', 'cash flow',
  'balance sheet', 'income statement', 'budget', 'forecast', 'q1', 'q2', 'q3', 'q4',
  'annual', 'financial statement', 'audit', 'tax', 'investment', 'shareholder',
];

const EDUCATIONAL_KEYWORDS = [
  'lesson', 'chapter', 'module', 'lecture', 'curriculum', 'syllabus',
  'learning objective', 'study', 'course', 'education', 'training',
  'workshop', 'seminar', 'tutorial', 'classroom', 'student', 'teacher',
  'professor', 'academic', 'knowledge', 'skill', 'learn', 'teach',
];

const SALES_KEYWORDS = [
  'product', 'launch', 'features', 'pricing', 'conversion', 'sales',
  'marketing', 'customer', 'revenue target', 'lead generation', 'funnel',
  'roi', 'value proposition', 'unique selling', 'market share',
  'competitive advantage', 'brand', 'campaign', 'promotion', 'discount',
  'upsell', 'cross-sell', 'pipeline', 'deal', 'closing',
];

function detectTheme(content) {
  const text = typeof content === 'string' ? content.toLowerCase() : JSON.stringify(content).toLowerCase();

  const financialScore = FINANCIAL_KEYWORDS.reduce((score, kw) =>
    score + (text.includes(kw) ? 1 : 0), 0);
  const educationalScore = EDUCATIONAL_KEYWORDS.reduce((score, kw) =>
    score + (text.includes(kw) ? 1 : 0), 0);
  const salesScore = SALES_KEYWORDS.reduce((score, kw) =>
    score + (text.includes(kw) ? 1 : 0), 0);

  const max = Math.max(financialScore, educationalScore, salesScore);

  if (max === 0) return 'default';
  if (max === financialScore) return 'financial';
  if (max === educationalScore) return 'educational';
  if (max === salesScore) return 'sales';

  return 'default';
}

module.exports = { detectTheme };
