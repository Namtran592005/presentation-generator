#!/usr/bin/env node

require('dotenv').config();
const { program } = require('commander');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');
const { processInputs, loadConfig, loadTemplate } = require('./agent-core');

program
  .name('ppt-agent')
  .description('AI-powered slide generator - converts documents to PowerPoint presentations')
  .version('1.0.0');

program
  .command('generate [inputDir] [outputDir]')
  .description('Process all supported documents in input directory and generate presentations')
  .option('-t, --template <path>', 'Custom template JSON path')
  .action(async (inputDir, outputDir, options) => {
    const config = loadConfig();
    const templatePath = options.template || config.templatePath;
    const inDir = inputDir || config.inputDir;
    const outDir = outputDir || config.outputDir;

    console.log('Presentation Generator v1.0.0');
    console.log(`Input:  ${path.resolve(inDir)}`);
    console.log(`Output: ${path.resolve(outDir)}`);
    console.log('---');

    try {
      const results = await processInputs(inDir, outDir, templatePath);
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      console.log('---');
      console.log(`Done. ${successCount} succeeded, ${failCount} failed.`);
    } catch (err) {
      console.error('Fatal error:', err.message);
      process.exit(1);
    }
  });

program
  .command('watch [inputDir] [outputDir]')
  .description('Watch input directory and automatically generate presentations for new/modified files')
  .option('-t, --template <path>', 'Custom template JSON path')
  .action(async (inputDir, outputDir, options) => {
    const config = loadConfig();
    const templatePath = options.template || config.templatePath;
    const inDir = path.resolve(inputDir || config.inputDir);
    const outDir = path.resolve(outputDir || config.outputDir);

    fs.mkdirSync(inDir, { recursive: true });
    fs.mkdirSync(outDir, { recursive: true });

    console.log('Presentation Generator - Watch Mode');
    console.log(`Watching: ${inDir}`);
    console.log(`Output:   ${outDir}`);
    console.log('Drop supported files (.md, .pdf, .docx, .xls, .xlsx) into the input folder.');
    console.log('Press Ctrl+C to stop.');
    console.log('---');

    const debounceTimers = {};

    const watcher = chokidar.watch(inDir, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 2000, pollInterval: 100 },
    });

    watcher.on('add', (filePath) => {
      const ext = path.extname(filePath).toLowerCase();
      if (!['.md', '.markdown', '.pdf', '.docx', '.doc', '.xlsx', '.xls'].includes(ext)) return;

      const fileName = path.basename(filePath);

      if (debounceTimers[fileName]) {
        clearTimeout(debounceTimers[fileName]);
      }

      debounceTimers[fileName] = setTimeout(async () => {
        console.log(`New file detected: ${fileName}`);
        try {
          const results = await processInputs(inDir, outDir, templatePath);
          const result = results[0];
          if (result && result.success) {
            console.log(`✓ Generated: ${path.basename(result.outputPath)}`);
          }
        } catch (err) {
          console.error(`✗ Error: ${err.message}`);
        }
        delete debounceTimers[fileName];
      }, 1500);
    });

    watcher.on('change', (filePath) => {
      const ext = path.extname(filePath).toLowerCase();
      if (!['.md', '.markdown', '.pdf', '.docx', '.doc', '.xlsx', '.xls'].includes(ext)) return;

      const fileName = path.basename(filePath);

      if (debounceTimers[fileName]) {
        clearTimeout(debounceTimers[fileName]);
      }

      debounceTimers[fileName] = setTimeout(async () => {
        console.log(`File modified: ${fileName}`);
        try {
          const results = await processInputs(inDir, outDir, templatePath);
          const result = results[0];
          if (result && result.success) {
            console.log(`✓ Regenerated: ${path.basename(result.outputPath)}`);
          }
        } catch (err) {
          console.error(`✗ Error: ${err.message}`);
        }
        delete debounceTimers[fileName];
      }, 1500);
    });

    process.on('SIGINT', () => {
      console.log('\nWatch mode stopped.');
      watcher.close();
      process.exit(0);
    });
  });

program
  .command('init')
  .description('Initialize project structure with default config and sample files')
  .action(() => {
    const root = process.cwd();
    const dirs = ['inputs', 'outputs', 'templates', 'src'];
    for (const dir of dirs) {
      fs.mkdirSync(path.join(root, dir), { recursive: true });
    }

    const envPath = path.join(root, '.env');
    if (!fs.existsSync(envPath)) {
      fs.writeFileSync(envPath, '# OpenAI API Key\nOPENAI_API_KEY=sk-your-key-here\nOPENAI_MODEL=gpt-4o\n');
      console.log('Created .env file - add your OpenAI API key');
    }

    console.log('Project initialized. Drop files into ./inputs/ and run:');
    console.log('  ppt-agent generate    # Process all files');
    console.log('  ppt-agent watch       # Watch for changes');
  });

if (require.main === module) {
  program.parse(process.argv);
}
