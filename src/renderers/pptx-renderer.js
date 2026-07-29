const PptxGenJS = require('pptxgenjs');
const path = require('path');

const ANIMATION_MAP = {
  title: { type: 'fade', duration: 1.5, delay: 0.5 },
  subtitle: { type: 'fade', duration: 1.0, delay: 0.8 },
  bullet: { type: 'fly', direction: 'left', duration: 0.6, delay: 0.2 },
  chart: { type: 'appear', duration: 0.5, delay: 0 },
  image: { type: 'appear', duration: 0.5, delay: 0 },
};

const TRANSITION_MAP = {
  fade: { type: 'fade', duration: 0.5 },
};

function setAnimation(shape, animType, index = 0) {
  const def = ANIMATION_MAP[animType];
  if (!def) return;
  const delay = animType === 'bullet' ? def.delay + (index * 0.2) : def.delay;
  shape.animate = { type: def.type, duration: def.duration, delay };
}

async function render(slides, themeConfig, templateConfig, outputPath) {
  const pptx = new PptxGenJS();
  const theme = themeConfig;
  const layout = templateConfig.masterLayout;

  pptx.defineLayout({ name: 'CUSTOM', width: layout.slideWidth, height: layout.slideHeight });
  pptx.layout = 'CUSTOM';

  for (let i = 0; i < slides.length; i++) {
    const slideDef = slides[i];
    const slide = pptx.addSlide();

    slide.background = { fill: theme.colors.background };

    if (slideDef.type === 'title') {
      renderTitleSlide(slide, slideDef, theme);
    } else if (slideDef.type === 'section') {
      renderSectionSlide(slide, slideDef, theme);
    } else if (slideDef.type === 'chart') {
      renderChartSlide(slide, slideDef, theme, templateConfig, pptx);
    } else if (slideDef.type === 'thankyou') {
      renderThankYouSlide(slide, slideDef, theme);
    } else {
      renderContentSlide(slide, slideDef, theme, pptx);
    }

    renderFooter(slide, i, slides.length, layout, templateConfig);
    slide.transition = TRANSITION_MAP.fade;
  }

  await pptx.writeFile({ fileName: outputPath });
  return outputPath;
}

function renderTitleSlide(slide, def, theme) {
  slide.background = { fill: theme.colors.primary };

  const titleShape = slide.addText(def.title, {
    x: 0.75, y: 2.0, w: 11.8, h: 1.5,
    fontSize: theme.sizes.title,
    fontFace: theme.fonts.title,
    color: theme.colors.lightText,
    bold: true,
    align: 'center',
    valign: 'middle',
  });
  setAnimation(titleShape, 'title');

  if (def.subtitle) {
    const subShape = slide.addText(def.subtitle, {
      x: 0.75, y: 3.8, w: 11.8, h: 1.0,
      fontSize: theme.sizes.subtitle,
      fontFace: theme.fonts.subtitle,
      color: theme.colors.lightText,
      align: 'center',
      valign: 'middle',
    });
    setAnimation(subShape, 'subtitle');
  }

  const dateShape = slide.addText(new Date().toLocaleDateString(), {
    x: 0.75, y: 5.5, w: 11.8, h: 0.5,
    fontSize: 14,
    fontFace: theme.fonts.body,
    color: theme.colors.lightText,
    align: 'center',
  });
  setAnimation(dateShape, 'subtitle');
}

function renderContentSlide(slide, def, theme, pptx) {
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0, y: 0, w: 13.333, h: 1.0,
    fill: { color: theme.colors.primary },
  });

  const titleShape = slide.addText(def.title, {
    x: 0.75, y: 0.15, w: 11.8, h: 0.7,
    fontSize: theme.sizes.subtitle,
    fontFace: theme.fonts.title,
    color: theme.colors.lightText,
    bold: true,
    valign: 'middle',
  });
  setAnimation(titleShape, 'title');

  if (def.bullets && def.bullets.length > 0) {
    const bulletTexts = def.bullets.map((b) => ({
      text: b,
      options: {
        fontSize: theme.sizes.body,
        fontFace: theme.fonts.body,
        color: theme.colors.text,
        bullet: { code: '2022', color: theme.colors.secondary },
        paraSpaceAfter: 6,
      },
    }));

    const bodyShape = slide.addText(bulletTexts, {
      x: 0.75, y: 1.3, w: 11.8, h: 5.2,
      valign: 'top',
      lineSpacingMultiple: 1.2,
    });
    setAnimation(bodyShape, 'bullet');
  }
}

function renderSectionSlide(slide, def, theme) {
  slide.background = { fill: theme.colors.accent };

  const shape = slide.addText(def.title, {
    x: 0.75, y: 2.5, w: 11.8, h: 2.0,
    fontSize: 44,
    fontFace: theme.fonts.title,
    color: theme.colors.lightText,
    bold: true,
    align: 'center',
    valign: 'middle',
  });
  setAnimation(shape, 'title');
}

function renderChartSlide(slide, def, theme, templateConfig, pptx) {
  const titleShape = slide.addText(def.title, {
    x: 0.75, y: 0.15, w: 11.8, h: 0.7,
    fontSize: theme.sizes.subtitle,
    fontFace: theme.fonts.title,
    color: theme.colors.primary,
    bold: true,
  });
  setAnimation(titleShape, 'title');

  if (def.chartData && def.chartData.datasets && def.chartData.datasets.length > 0) {
    const chartArr = def.chartData.datasets.map(ds => ({
      name: ds.name,
      labels: def.chartData.labels,
      values: ds.values,
    }));

    const chartOpts = {
      x: 0.75, y: 1.1, w: 11.8, h: 5.0,
      showLegend: true,
      showGrid: true,
      showValue: true,
      chartColors: templateConfig.chartDefaults.barColors,
      barGrouping: 'clustered',
      catAxisLabelFontSize: 11,
      valAxisLabelFontSize: 11,
      dataLabelFontSize: 10,
    };

    const chartShape = slide.addChart(pptx.charts.BAR, chartArr, chartOpts);
    setAnimation(chartShape, 'chart');
  }

  if (def.bullets && def.bullets.length > 0) {
    const bulletTexts = def.bullets.slice(0, 1).map(b => ({
      text: b,
      options: {
        fontSize: 14,
        fontFace: theme.fonts.body,
        color: theme.colors.text,
      },
    }));
    slide.addText(bulletTexts, {
      x: 0.75, y: 6.3, w: 11.8, h: 0.5,
    });
  }
}

function renderThankYouSlide(slide, def, theme, index, total) {
  slide.background = { fill: theme.colors.primary };

  const titleShape = slide.addText(def.title, {
    x: 0.75, y: 2.5, w: 11.8, h: 1.5,
    fontSize: 48,
    fontFace: theme.fonts.title,
    color: theme.colors.lightText,
    bold: true,
    align: 'center',
    valign: 'middle',
  });
  setAnimation(titleShape, 'title');

  if (def.subtitle) {
    const subShape = slide.addText(def.subtitle, {
      x: 0.75, y: 4.2, w: 11.8, h: 0.8,
      fontSize: 18,
      fontFace: theme.fonts.subtitle,
      color: theme.colors.lightText,
      align: 'center',
    });
    setAnimation(subShape, 'subtitle');
  }
}

function renderFooter(slide, index, total, layout, templateConfig) {
  if (!layout.footer.enabled) return;

  slide.addText(`${templateConfig.masterLayout.footer.text || 'Generated by Presentation Generator'} | Page ${index + 1} of ${total}`, {
    x: 0.75, y: layout.slideHeight - 0.4, w: 11.8, h: 0.3,
    fontSize: layout.footer.fontSize,
    fontFace: 'Calibri',
    color: layout.footer.color,
    align: 'center',
  });
}

module.exports = { render };
