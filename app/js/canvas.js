//
// canvas.js
//
// Manages canvas events for the chart.
//

let w;
let h;

const drawGrid = (numLines, color, width) => {
  const ctx = document.getElementById('chart-canvas').getContext('2d');
  ctx.beginPath();
  ctx.strokeStyle = color || 'rgba(255, 255, 255, .75)';
  ctx.lineWidth = width || 1;

  let spacing = (h / numLines) || (h / 10);
  for (let i = 0; i < h / spacing; i++) {
    const j = i * spacing;
    ctx.moveTo(0, j);
    ctx.lineTo(w, j);
  }

  spacing = (w / numLines) || (w / 3);
  for (let i = 0; i < w / spacing; i++) {
    const j = (i * spacing);
    ctx.moveTo(j, 0);
    ctx.lineTo(j, h);
  }

  ctx.stroke();
  // ctx.fillRect(0, (h - 4) / 2, w, 4);
};

const updateCanvas = () => {
  const bounds = document.getElementById('chart-canvas').getBoundingClientRect();
  w = bounds.width;
  h = bounds.height;
  document.getElementById('chart-canvas').width = w;
  document.getElementById('chart-canvas').height = h;
  drawGrid(w / 100, 'rgba(255, 255, 255, .5)');
  drawGrid(w / 50);
};

updateCanvas();
window.onresize = updateCanvas;
