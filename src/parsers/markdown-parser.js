const fs = require('fs');
const path = require('path');

function finalizeSlide(slide) {
  if (!slide._tableState) return;
  const { headers, dataRows } = slide._tableState;
  if (dataRows.length === 0) return;
  const numericCols = [];
  for (let c = 0; c < headers.length; c++) {
    const nums = dataRows.filter(r => r[c] && !isNaN(parseFloat(r[c].replace(/[,$%]/g, '')))).length;
    if (nums > dataRows.length * 0.5) numericCols.push(c);
  }
  if (numericCols.length === 0) return;
  const labelCol = numericCols[0] === 0 ? 1 : 0;
  const slideType = headers[labelCol] && dataRows[0]?.[labelCol] ? 'chart' : slide.type;
  if (slideType === 'chart') slide.type = 'chart';
  slide.chartData = {
    labels: dataRows.map(r => r[labelCol] || ''),
    datasets: numericCols.map(col => ({
      name: headers[col] || `Column ${col + 1}`,
      values: dataRows.map(r => parseFloat(String(r[col] || '0').replace(/[,$%]/g, '')) || 0),
    })),
  };
  delete slide._tableState;
}

function parse(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const lines = raw.split('\n');
  const slides = [];
  let currentSlide = null;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('# ') || trimmed.startsWith('## ')) {
      if (currentSlide) {
        finalizeSlide(currentSlide);
        slides.push(currentSlide);
      }
      const level = trimmed.startsWith('# ') ? 1 : 2;
      currentSlide = {
        type: level === 1 ? 'title' : 'content',
        title: trimmed.replace(/^#+\s*/, ''),
        bullets: [],
        chartData: null,
        level,
      };
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (currentSlide) {
        currentSlide.bullets.push(trimmed.replace(/^[-*]\s*/, ''));
      }
    } else if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed.split('|').filter(c => c.trim()).map(c => c.trim());
      if (!currentSlide || cells.length < 2) continue;
      const isSepRow = cells.every(c => /^[-:]+$/.test(c));
      if (isSepRow) continue;
      if (currentSlide && !currentSlide._tableState) {
        currentSlide._tableState = { headers: cells, dataRows: [] };
      } else if (currentSlide && currentSlide._tableState) {
        currentSlide._tableState.dataRows.push(cells);
      }
    } else if (trimmed && !trimmed.startsWith('---') && !trimmed.startsWith('===')) {
      if (currentSlide) {
        currentSlide.bullets.push(trimmed);
      }
    }
  }

  if (currentSlide) {
    finalizeSlide(currentSlide);
    slides.push(currentSlide);
  }

  return {
    source: path.basename(filePath),
    type: 'markdown',
    slides,
    rawText: raw,
    metadata: { totalLines: lines.length },
  };
}

module.exports = { parse };
