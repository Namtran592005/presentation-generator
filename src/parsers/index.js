const path = require('path');
const markdownParser = require('./markdown-parser');
const pdfParser = require('./pdf-parser');
const docxParser = require('./docx-parser');
const xlsxParser = require('./xlsx-parser');

const EXTENSION_MAP = {
  '.md': markdownParser,
  '.markdown': markdownParser,
  '.pdf': pdfParser,
  '.docx': docxParser,
  '.doc': docxParser,
  '.xlsx': xlsxParser,
  '.xls': xlsxParser,
};

function getParser(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return EXTENSION_MAP[ext] || null;
}

async function parseFile(filePath) {
  const parser = getParser(filePath);
  if (!parser) {
    throw new Error(`Unsupported file type: ${path.extname(filePath)}. Supported types: ${Object.keys(EXTENSION_MAP).join(', ')}`);
  }
  return await parser.parse(filePath);
}

module.exports = { parseFile, getParser, EXTENSION_MAP };
