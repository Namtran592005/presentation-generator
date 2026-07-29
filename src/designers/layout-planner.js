const crypto = require('crypto');

function planLayout(parsedContent) {
  const { slides, rawText, source } = parsedContent;
  const wordCount = rawText.split(/\s+/).filter(w => w).length;

  let plannedSlides = [];
  const hasChartData = slides.some(s => s.chartData && s.chartData.datasets && s.chartData.datasets.length > 0);

  plannedSlides.push({
    type: 'title',
    title: source.replace(/\.[^.]+$/, '').replace(/[_\-]/g, ' '),
    subtitle: 'Generated Presentation',
    bullets: [],
    chartData: null,
  });

  if (slides.length > 0) {
    for (const slide of slides) {
      if (slide.type === 'title' && slide.title.toLowerCase() === source.replace(/\.[^.]+$/, '').toLowerCase()) {
        continue;
      }

      if (hasChartData && slide.chartData) {
        plannedSlides.push({
          type: 'chart',
          title: slide.title || 'Data Overview',
          bullets: slide.bullets.slice(0, 2),
          chartData: slide.chartData,
        });
      } else if (slide.type === 'title') {
        plannedSlides.push({
          type: 'section',
          title: slide.title,
          bullets: [],
          chartData: null,
        });
      } else {
        const bullets = slide.bullets.slice(0, 5);
        if (bullets.length > 0 || slide.title) {
          plannedSlides.push({
            type: 'content',
            title: slide.title || 'Key Points',
            bullets,
            chartData: null,
          });
        }
      }
    }
  }

  if (wordCount > 0 && plannedSlides.length === 1) {
    const estimatedSlides = Math.max(1, Math.min(5, Math.floor(wordCount / 200)));
    const wordsPerSlide = Math.ceil(wordCount / estimatedSlides);
    const words = rawText.split(/\s+/).filter(w => w);

    for (let i = 0; i < estimatedSlides; i++) {
      const chunk = words.slice(i * wordsPerSlide, (i + 1) * wordsPerSlide).join(' ');
      plannedSlides.push({
        type: 'content',
        title: `Topic ${i + 1}`,
        bullets: chunk.match(/.{1,120}(?:\s|$)/g)?.slice(0, 5).map(s => s.trim()) || [chunk.slice(0, 120)],
        chartData: null,
      });
    }
  }

  plannedSlides.push({
    type: 'thankyou',
    title: 'Thank You',
    subtitle: 'Generated with AI-Powered Presentation Generator',
    bullets: [],
    chartData: null,
  });

  if (plannedSlides.length > 20) {
    plannedSlides = [plannedSlides[0], ...plannedSlides.slice(1, -1).filter((_, i) => i % 2 === 0), plannedSlides[plannedSlides.length - 1]];
  }

  return plannedSlides;
}

function calculateContentHash(content) {
  return crypto.createHash('md5').update(JSON.stringify(content)).digest('hex');
}

module.exports = { planLayout, calculateContentHash };
