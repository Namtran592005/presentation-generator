const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

async function parse(filePath) {
  const buffer = fs.readFileSync(filePath);
  const result = await mammoth.convertToHtml({ buffer });
  const html = result.value;

  const slides = [];
  let currentSlide = null;

  const lines = html
    .replace(/<h1>/g, '\n###TITLE### ')
    .replace(/<h2>/g, '\n###SECTION### ')
    .replace(/<h3>/g, '\n###SUBSECTION### ')
    .replace(/<li>/g, '\n###BULLET### ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l);

  for (const line of lines) {
    if (line.startsWith('###TITLE### ')) {
      if (currentSlide) slides.push(currentSlide);
      currentSlide = { type: 'title', title: line.replace('###TITLE### ', ''), bullets: [], chartData: null };
    } else if (line.startsWith('###SECTION### ') || line.startsWith('###SUBSECTION### ')) {
      if (currentSlide) slides.push(currentSlide);
      const type = line.startsWith('###SECTION### ') ? 'content' : 'content';
      currentSlide = { type, title: line.replace(/###(SECTION|SUBSECTION)### /, ''), bullets: [], chartData: null };
    } else if (line.startsWith('###BULLET### ')) {
      if (currentSlide) {
        currentSlide.bullets.push(line.replace('###BULLET### ', ''));
      }
    } else if (line && !line.startsWith('###')) {
      if (!currentSlide) {
        currentSlide = { type: 'content', title: 'Content', bullets: [], chartData: null };
      }
      currentSlide.bullets.push(line);
    }
  }

  if (currentSlide) slides.push(currentSlide);

  return {
    source: path.basename(filePath),
    type: 'docx',
    slides,
    rawText: result.value.replace(/<[^>]+>/g, ' '),
    metadata: {
      title: path.basename(filePath),
      warnings: result.messages.filter(m => m.type === 'warning').map(m => m.message),
    },
  };
}

module.exports = { parse };
