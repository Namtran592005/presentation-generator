const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

async function parse(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);

  const pages = data.text.split(/\f/).filter(p => p.trim());
  const slides = [];
  let currentSlide = null;

  for (const pageText of pages) {
    const lines = pageText.split('\n').filter(l => l.trim());

    for (const line of lines) {
      const trimmed = line.trim();

      const isHeading = trimmed.length < 100 &&
        (trimmed === trimmed.toUpperCase() && trimmed.length > 3) ||
        (trimmed.match(/^[A-Z][a-z]+(\s[A-Z][a-z]+)*$/) && trimmed.length < 60);

      if (isHeading) {
        if (currentSlide) slides.push(currentSlide);
        currentSlide = { type: 'content', title: trimmed, bullets: [], chartData: null };
      } else if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
        if (currentSlide) currentSlide.bullets.push(trimmed.replace(/^[•\-*]\s*/, ''));
      } else if (trimmed.match(/^\d+[\.\)]/)) {
        if (currentSlide) currentSlide.bullets.push(trimmed.replace(/^\d+[\.\)]\s*/, ''));
      } else if (trimmed) {
        if (currentSlide) {
          if (currentSlide.bullets.length > 0) {
            currentSlide.bullets[currentSlide.bullets.length - 1] += ' ' + trimmed;
          } else {
            currentSlide.bullets.push(trimmed);
          }
        }
      }
    }
  }

  if (currentSlide) slides.push(currentSlide);

  const metadata = {
    pageCount: data.numpages || pages.length,
    title: data.info?.Title || path.basename(filePath),
    author: data.info?.Author || '',
  };

  return {
    source: path.basename(filePath),
    type: 'pdf',
    slides,
    rawText: data.text,
    metadata,
  };
}

module.exports = { parse };
