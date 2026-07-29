const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const { z } = require('zod');

const SlideSchema = z.object({
  slides: z.array(z.object({
    type: z.enum(['title', 'content', 'chart', 'section', 'thankyou']),
    title: z.string().min(1).max(100),
    subtitle: z.string().optional(),
    bullets: z.array(z.string().max(80)).max(5).optional(),
    chartData: z.object({
      labels: z.array(z.string()),
      datasets: z.array(z.object({
        name: z.string(),
        values: z.array(z.number()),
      })),
    }).nullable().optional(),
  })).min(2).max(20),
});

function loadAgentMd() {
  const agentPath = path.resolve(process.cwd(), 'AGENT.md');
  if (fs.existsSync(agentPath)) {
    return fs.readFileSync(agentPath, 'utf-8');
  }
  return '';
}

async function generateLayout(parsedContent, theme, templateConfig) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const openai = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL || 'gpt-4o';
  const agentMd = loadAgentMd();

  const textPreview = parsedContent.rawText.slice(0, 8000);

  const systemMsg = agentMd ? `${agentMd}\n\nApply the theme "${theme}" with colors: ${JSON.stringify(templateConfig.themes[theme]?.colors || templateConfig.themes.default.colors)}` : '';

  const userMsg = `Generate slide layout JSON from this document. Follow rules strictly. Return only valid JSON with structure:
{
  "slides": [
    {
      "type": "title" | "content" | "chart" | "section" | "thankyou",
      "title": "string",
      "subtitle": "string (optional)",
      "bullets": ["string", ...] (max 5, each max 80 chars),
      "chartData": { "labels": ["string",...], "datasets": [{"name":"string","values":[number,...]}] } | null
    }
  ]
}

Source file: ${parsedContent.source}
Type: ${parsedContent.type}
Theme: ${theme}

Content:
${textPreview}`;

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemMsg },
        { role: 'user', content: userMsg },
      ],
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const validated = SlideSchema.parse(parsed);
    return validated.slides;
  } catch (err) {
    console.warn(`LLM design failed: ${err.message}. Falling back to rule-based planner.`);
    return null;
  }
}

module.exports = { generateLayout, SlideSchema };
