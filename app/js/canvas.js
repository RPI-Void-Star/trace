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
    this.activeBlock = undefined;
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
  }

  addBlock(x, y) {
    const block = new Block(x, y);
    this.container.appendChild(block.element);
    this.blocks.push(block);
    block.element.addEventListener('click', () => {
      if (this.activeBlock) {
        this.activeBlock.toggleHighlight();
      }
      block.toggleHighlight();
      this.activeBlock = block;
    }, false);
  }

}

module.exports = Canvas;
