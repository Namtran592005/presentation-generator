const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

function parse(filePath) {
  const buffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const slides = [];
  let allText = '';

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (json.length === 0) continue;

    const headerRow = json[0];
    const dataRows = json.slice(1).filter(r => r.some(c => c !== undefined && c !== ''));

    const numericColumns = [];
    const textColumns = [];

    for (let col = 0; col < headerRow.length; col++) {
      const values = dataRows.map(r => r[col]).filter(v => v !== undefined);
      const numCount = values.filter(v => typeof v === 'number' || (!isNaN(parseFloat(v)) && v.toString().trim() !== '')).length;
      if (numCount > values.length * 0.5) {
        numericColumns.push(col);
      } else {
        textColumns.push(col);
      }
    }

    if (numericColumns.length > 0 && textColumns.length > 0) {
      const slide = {
        type: 'chart',
        title: `${sheetName} - Data Overview`,
        bullets: [],
        chartData: {
          labels: dataRows.map(r => r[textColumns[0]] || ''),
          datasets: [],
        },
      };

      for (const numCol of numericColumns) {
        const columnName = headerRow[numCol] || `Column ${numCol + 1}`;
        slide.chartData.datasets.push({
          name: columnName,
          values: dataRows.map(r => {
            const v = r[numCol];
            return typeof v === 'number' ? v : parseFloat(String(v).replace(/[,$%]/g, '')) || 0;
          }),
        });
      }

      slides.push(slide);
    }

    allText += `Sheet: ${sheetName}\n`;
    allText += json.map(row => row.join('\t')).join('\n') + '\n\n';
  }

  if (slides.length === 0) {
    slides.push({
      type: 'content',
      title: workbook.SheetNames[0] || 'Spreadsheet Data',
      bullets: [allText.slice(0, 1000)],
      chartData: null,
    });
  }

  return {
    source: path.basename(filePath),
    type: 'xlsx',
    slides,
    rawText: allText,
    metadata: {
      sheetCount: workbook.SheetNames.length,
      sheetNames: workbook.SheetNames,
    },
  };
}

module.exports = { parse };
