require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { parseFile } = require('./parsers/index');
const { detectTheme } = require('./designers/theme-detector');
const { planLayout, calculateContentHash } = require('./designers/layout-planner');
const { generateLayout } = require('./designers/llm-designer');
const { render } = require('./renderers/pptx-renderer');
const { validate } = require('./validators/slide-validator');
const crypto = require('crypto');

const LLM_CACHE = new Map();

function loadConfig() {
  const configPath = path.resolve(process.cwd(), 'config.json');
  const defaults = {
    templatePath: path.resolve(process.cwd(), 'templates', 'template.json'),
    inputDir: path.resolve(process.cwd(), 'inputs'),
    outputDir: path.resolve(process.cwd(), 'outputs'),
  };

  if (fs.existsSync(configPath)) {
    try {
      const userConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return { ...defaults, ...userConfig };
    } catch {
      return defaults;
    }
  }
  return defaults;
}

function loadTemplate(templatePath) {
  const resolvedPath = path.resolve(process.cwd(), templatePath);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Template not found at: ${resolvedPath}`);
  }
  return JSON.parse(fs.readFileSync(resolvedPath, 'utf-8'));
}

function getOutputPath(sourceName, outputDir) {
  const baseName = path.basename(sourceName, path.extname(sourceName));
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = `${baseName}_presentation.pptx`;
  return path.join(outputDir, fileName);
}

const contentCache = new Map();

async function processFile(filePath, config, template) {
  const startTime = Date.now();
  const fileName = path.basename(filePath);
  const log = [];

  log.push(`Processing: ${fileName}`);

  const parsed = await parseFile(filePath);
  const contentHash = crypto.createHash('md5').update(parsed.rawText).digest('hex');

  if (contentCache.has(contentHash)) {
    log.push('Content unchanged, using cached layout');
    const cached = contentCache.get(contentHash);
    const outputPath = getOutputPath(fileName, config.outputDir);
    await render(cached.slides, cached.themeConfig, template, outputPath);
    log.push(`Output (cached): ${outputPath}`);
    return { success: true, outputPath, slides: cached.slides.length, log, duration: Date.now() - startTime };
  }

  const theme = detectTheme(parsed.rawText);
  const themeConfig = template.themes[theme] || template.themes.default;
  log.push(`Detected theme: ${theme}`);

  let slides = null;

  slides = await generateLayout(parsed, theme, template);

  if (!slides) {
    log.push('Using rule-based layout planner (LLM unavailable or failed)');
    slides = planLayout(parsed);
  }

  const validation = validate(slides, themeConfig);
  if (!validation.valid) {
    for (const err of validation.errors) {
      log.push(`Validation error: ${err}`);
    }
  }
  for (const warn of validation.warnings) {
    log.push(`Warning: ${warn}`);
  }

  const outputPath = getOutputPath(fileName, config.outputDir);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await render(slides, themeConfig, template, outputPath);

  contentCache.set(contentHash, { slides, themeConfig });
  log.push(`Output: ${outputPath}`);
  log.push(`Generated ${slides.length} slides in ${Date.now() - startTime}ms`);

  return { success: true, outputPath, slides: slides.length, log, duration: Date.now() - startTime };
}

async function processInputs(inputDir, outputDir, templatePath) {
  const config = loadConfig();
  const template = loadTemplate(templatePath || config.templatePath);
  const inputDirectory = path.resolve(process.cwd(), inputDir || config.inputDir);
  const outputDirectory = path.resolve(process.cwd(), outputDir || config.outputDir);

  fs.mkdirSync(inputDirectory, { recursive: true });
  fs.mkdirSync(outputDirectory, { recursive: true });

  const files = fs.readdirSync(inputDirectory)
    .filter(f => {
      const ext = path.extname(f).toLowerCase();
      return ['.md', '.markdown', '.pdf', '.docx', '.doc', '.xlsx', '.xls'].includes(ext);
    })
    .map(f => path.join(inputDirectory, f));

  if (files.length === 0) {
    console.log('No supported files found in inputs directory.');
    console.log('Supported formats: .md, .pdf, .docx, .xls, .xlsx');
    return [];
  }

  const results = [];
  for (const filePath of files) {
    try {
      const result = await processFile(filePath, { outputDir: outputDirectory }, template);
      results.push(result);
      console.log(result.log.join('\n'));
      console.log('---');
    } catch (err) {
      console.error(`Error processing ${path.basename(filePath)}: ${err.message}`);
      logError(filePath, err);
      results.push({ success: false, error: err.message, file: path.basename(filePath) });
    }
  }

  return results;
}

function logError(filePath, error) {
  const logLine = `[${new Date().toISOString()}] ${path.basename(filePath)}: ${error.stack || error.message}\n`;
  fs.appendFileSync(path.join(process.cwd(), 'errors.log'), logLine);
}

async function main() {
  const config = loadConfig();
  const template = loadTemplate(config.templatePath);
  const inputDir = process.argv[2] || config.inputDir;
  const outputDir = process.argv[3] || config.outputDir;

  await processInputs(inputDir, outputDir, config.templatePath);
}

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { processInputs, processFile, loadConfig, loadTemplate };
