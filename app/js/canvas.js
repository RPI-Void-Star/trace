//
// canvas.js
//
// Manages canvas events for the chart.
//


class Canvas {

  constructor(element, container) {
    this.element = element;
    this.container = container;
    this.w = 0;
    this.h = 0;
    this.blocks = {};
    this.redraw();
  }

  drawGrid() {
    const bounds = this.element.getBoundingClientRect();
    this.w = bounds.width;
    this.h = bounds.height;
    this.element.width = this.w;
    this.element.height = this.h;
    this.drawLines(this.w / 100, 'rgba(255, 255, 255, .5)');
    this.drawLines(this.w / 50);
  }

  drawLines(numLines, color, width) {
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

  // Function from: http://stackoverflow.com/questions/808826/draw-arrow-on-canvas-tag#6333775
  // Author: SteampunkWizard
  drawArrow(startCoords, endCoords) {
    const { x: startx, y: starty } = startCoords;
    const { x: endx, y: endy } = endCoords;
    const lineWidth = 2;

    // variables to be used when creating the arrow
    const ctx = this.element.getContext('2d');
    const headlen = 10;

    const angle = Math.atan2(endy - starty, endx - startx);

    // starting path of the arrow from the start square to the end square and drawing the stroke
    ctx.beginPath();
    ctx.moveTo(startx, starty);
    ctx.lineTo(endx, endy);
    ctx.strokeStyle = '#cc0000';
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // starting a new path from the head of the arrow to one of the sides of the point
    const halfway = (start, end) => ((end - start) / 1.75) + start;
    ctx.beginPath();
    ctx.moveTo(halfway(startx, endx), halfway(starty, endy));

    ctx.lineTo(halfway(startx, endx) - (headlen * Math.cos(angle - (Math.PI / 7))),
        halfway(starty, endy) - (headlen * Math.sin(angle - (Math.PI / 7))));

    // path from the side point of the arrow, to the other side point
    ctx.lineTo(halfway(startx, endx) - (headlen * Math.cos(angle + (Math.PI / 7))),
        halfway(starty, endy) - (headlen * Math.sin(angle + (Math.PI / 7))));

    // path from the side point back to the tip of the arrow,
    //   and then again to the opposite side point
    ctx.lineTo(halfway(startx, endx), halfway(starty, endy));
    ctx.lineTo(halfway(startx, endx) - (headlen * Math.cos(angle - (Math.PI / 7))),
        halfway(starty, endy) - (headlen * Math.sin(angle - (Math.PI / 7))));

    // draws the paths created above
    ctx.strokeStyle = '#cc0000';
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.fillStyle = '#cc0000';
    ctx.fill();
  }

  // Draw all grids and block connections
  redraw() {
    this.clearCanvas();
    this.drawGrid();
    const getCenter = block => ({
      x: block.loc.x + (block.element.getBoundingClientRect().width / 2),
      y: block.loc.y + (block.element.getBoundingClientRect().height / 2),
    });

    Object.keys(this.blocks).forEach((key) => {
      const block = this.blocks[key];
      if (block.next) {
        this.drawArrow(
          getCenter(block),
          getCenter(this.blocks[block.next])
        ); }
    });
  }


  // Clear drawings from canvas
  clearCanvas() {
    const ctx = this.element.getContext('2d');
    ctx.clearRect(0, 0, this.element.width, this.element.height);
  }

  addBlock(block) {
    // If there are no blocks, make the first block have an id of new
    this.container.appendChild(block.element);
    this.blocks[block.uid] = block;
  }

  removeBlock(block) {
    if (block.type === 'loop') {
      block.children.forEach(child => this.removeBlock(child));
    }
    Object.keys(this.blocks).forEach((key) => {
      // If a block is referring to the block we are deleting
      //  remove the reference
      if (this.blocks[this.blocks[key].next] === block) {
        this.blocks[key].next = undefined;
      }
    });

    block.element.remove();
    delete this.blocks[block.uid];
    this.redraw();
  }

  getBlockForElement(elm) {
    let returnvalue;
    Object.keys(this.blocks).forEach((key) => {
      if (this.blocks[key].element === elm) {
        returnvalue = this.blocks[key];
      }
    });
    return returnvalue
  }

  clearBlockHighlight() {
    Object.keys(this.blocks).forEach((key) => {
      const block = this.blocks[key];
      block.removeHighlight();
    });
  }

  clear() {
    Object.keys(this.blocks).forEach((key) => {
      const block = this.blocks[key];
      block.element.remove();
    });
    this.blocks = {};
    this.redraw();
  }
}
module.exports = Canvas;
