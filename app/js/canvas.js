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

  // Draw the square grid on the canvas.
  drawGrid() {
    const bounds = this.element.getBoundingClientRect();
    this.w = bounds.width;
    this.h = bounds.height;
    this.element.width = this.w;
    this.element.height = this.h;
    this.drawLines(this.w / 100, 'rgba(255, 255, 255, .5)');
    this.drawLines(this.w / 50);
  }

  // Draws lines on the canvas element.
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

  // Function originally from: http://stackoverflow.com/questions/808826/draw-arrow-on-canvas-tag#6333775
  // Author: SteampunkWizard
  //
  // Code modified to move arrow heads to halfway-point.
  drawArrow(startCoords, endCoords, color) {
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
    ctx.strokeStyle = color || '#cc0000';
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
    ctx.strokeStyle = color || '#cc0000';
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.fillStyle = color || '#cc0000';
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
        );
      }

      if (block.type === 'conditional') {
        if (block.onTrue && this.blocks[block.onTrue]) {
          this.drawArrow(
            getCenter(block),
            getCenter(this.blocks[block.onTrue]),
            '#00cc00'
          );
        }
        if (block.onFalse && this.blocks[block.onFalse]) {
          this.drawArrow(
            getCenter(block),
            getCenter(this.blocks[block.onFalse]),
            '#0000cc'
          );
        }
      }
    });
  }

  // Clear drawings from canvas
  clearCanvas() {
    const ctx = this.element.getContext('2d');
    ctx.clearRect(0, 0, this.element.width, this.element.height);
  }

  addBlock(block, doNotAppend) {
    // If there are no blocks, make the first block have an id of new
    if (!doNotAppend) { this.container.appendChild(block.element); }
    this.blocks[block.uid] = block;
  }

  removeBlock(block) {
    if (block.type === 'loop') {
      // Maintain a list of the old blocks so the modifications does not
      //   affect iteration.
      const oldBlocks = JSON.parse(JSON.stringify(block.children));
      oldBlocks.forEach(child => this.removeBlock(this.blocks[child]));
    }
    Object.keys(this.blocks).forEach((key) => {
      // If a block is referring to the block we are deleting
      //  remove the reference
      if (this.blocks[this.blocks[key].next] === block) {
        const prevBlock = this.blocks[key];
        // Connect blocks to reestablish chain if it exists.
        if (block.next) {
          prevBlock.next = block.next;
        } else {
          this.blocks[key].next = undefined;
        }
      }

      // Check in conditionals and loops for nested links to the block
      //   that is being deleted.
      if (this.blocks[key].type === 'conditional') {
        if (this.blocks[key].onTrue === block.uid) { this.blocks[key].onTrue = undefined; }
        if (this.blocks[key].onFalse === block.uid) { this.blocks[key].onFalse = undefined; }
      } else if (this.blocks[key].type === 'loop') {
        if (this.blocks[key].children.indexOf(block.uid) !== -1) {
          this.blocks[key].children.splice(this.blocks[key].children.indexOf(block.uid), 1);
          // If our loop has no inner blocks remove the full style.
          if (this.blocks[key].children.length === 0) {
            this.blocks[key].element.classList.remove('full');
          }
        }
      }
    });

    block.element.remove();
    delete this.blocks[block.uid];
    this.redraw();
  }

  // Returns the block for the given html element.
  getBlockForElement(elm) {
    let returnvalue;
    Object.keys(this.blocks).forEach((key) => {
      if (this.blocks[key].element === elm) {
        returnvalue = this.blocks[key];
      }
    });
    return returnvalue;
  }

  // Removes highlighting from a block.
  clearBlockHighlight() {
    Object.keys(this.blocks).forEach((key) => {
      const block = this.blocks[key];
      block.removeHighlight();
    });
  }

  // Clears the canvas.
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
