//
// canvas.js
//
// Manages canvas events for the chart.
//
const Block = require('./block.js').Block;


class Canvas {

  constructor(element, container) {
    this.element = element;
    this.container = container;
    this.w = 0;
    this.h = 0;
    this.blocks = [];
    this.updateCanvas();
    window.onresize = this.updateCanvas;
    this.container.addEventListener('drop', e => Canvas.blockDropped(this, e), this);
    this.container.addEventListener('dragover', Canvas.dragOver, false);
  }

  updateCanvas() {
    const bounds = this.element.getBoundingClientRect();
    this.w = bounds.width;
    this.h = bounds.height;
    this.element.width = this.w;
    this.element.height = this.h;
    this.drawGrid(this.w / 100, 'rgba(255, 255, 255, .5)');
    this.drawGrid(this.w / 50);
  }

  drawGrid(numLines, color, width) {
    const ctx = this.element.getContext('2d');
    ctx.beginPath();
    ctx.strokeStyle = color || 'rgba(255, 255, 255, .75)';
    ctx.lineWidth = width || 1;

    let spacing = (this.h / numLines) || (this.h / 10);
    for (let i = 0; i < this.h / spacing; i++) {
      const j = i * spacing;
      ctx.moveTo(0, j);
      ctx.lineTo(this.w, j);
    }

    spacing = (this.w / numLines) || (this.w / 3);
    for (let i = 0; i < this.w / spacing; i++) {
      const j = (i * spacing);
      ctx.moveTo(j, 0);
      ctx.lineTo(j, this.h);
    }

    ctx.stroke();
    // ctx.fillRect(0, (h - 4) / 2, w, 4);
  }

}

Canvas.blockDropped = (that, event) => {
  // Detects when blocks are dropped onto the canvas
  //  and adds a copy of the block.
  event.preventDefault();
  event.stopPropagation();
  // move dragged elem to the selected drop target
  if (that.container === event.target) {
    const newBlock = new Block(event.layerX, event.layerY);
    that.container.appendChild(newBlock.element);
    that.blocks.push(newBlock);
  }
  return false;
};

Canvas.dragOver = (event) => {
  event.preventDefault();
  event.stopPropagation();
  return false;
};


module.exports = Canvas;
