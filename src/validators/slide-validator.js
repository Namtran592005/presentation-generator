const colorConvert = require('color-convert');

function validate(slides, themeConfig) {
  const warnings = [];
  const errors = [];
  const textColor = themeConfig?.colors?.text || '#2C3E50';
  const bgColor = themeConfig?.colors?.background || '#FFFFFF';

  if (slides.length < 2) {
    errors.push('Presentation must have at least 2 slides');
  }

  if (slides.length > 20) {
    warnings.push(`Presentation has ${slides.length} slides (recommended max: 20)`);
  }

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];

    if (!slide.title || slide.title.trim() === '') {
      errors.push(`Slide ${i + 1} has no title`);
    }

    if (slide.title && slide.title.length > 100) {
      warnings.push(`Slide ${i + 1} title is too long (${slide.title.length} chars, max 100)`);
    }

    if (slide.bullets) {
      if (slide.bullets.length > 5) {
        warnings.push(`Slide ${i + 1} has ${slide.bullets.length} bullets (recommended max: 5)`);
      }

      for (let j = 0; j < slide.bullets.length; j++) {
        if (slide.bullets[j].length > 80) {
          warnings.push(`Slide ${i + 1}, bullet ${j + 1} is ${slide.bullets[j].length} chars (recommended max: 80)`);
        }
      }
    }

    if (slide.chartData) {
      if (!slide.chartData.labels || slide.chartData.labels.length === 0) {
        errors.push(`Slide ${i + 1} has chart type but no labels`);
      }
      if (!slide.chartData.datasets || slide.chartData.datasets.length === 0) {
        errors.push(`Slide ${i + 1} has chart type but no datasets`);
      }
    }
  }

  try {
    const bgRgb = colorConvert.hex.rgb(bgColor);
    const textRgb = colorConvert.hex.rgb(textColor);
    const contrastRatio = calculateContrastRatio(bgRgb, textRgb);
    if (contrastRatio < 4.5) {
      warnings.push(`Text/background contrast ratio is ${contrastRatio.toFixed(2)} (recommended minimum: 4.5)`);
    }
  } catch {
    warnings.push('Could not verify color contrast (invalid color format)');
  }

  return { valid: errors.length === 0, errors, warnings };
}

function calculateContrastRatio(rgb1, rgb2) {
  const lum1 = getRelativeLuminance(rgb1);
  const lum2 = getRelativeLuminance(rgb2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getRelativeLuminance([r, g, b]) {
  const [rs, gs, bs] = [r, g, b].map(v => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

module.exports = { validate };
