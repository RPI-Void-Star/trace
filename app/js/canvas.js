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
    this.blocks = [];
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
  drawArrow(startCoords, endCoords){
    const { x: startx, y: starty } = startCoords
    const { x: endx, y: endy } = endCoords
    const lineWidth = 2

    //variables to be used when creating the arrow
    var ctx = this.element.getContext("2d");
    var headlen = 10;

    var angle = Math.atan2(endy-starty,endx-startx);

    //starting path of the arrow from the start square to the end square and drawing the stroke
    ctx.beginPath();
    ctx.moveTo(startx, starty);
    ctx.lineTo(endx, endy);
    ctx.strokeStyle = "#cc0000";
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    //starting a new path from the head of the arrow to one of the sides of the point
    ctx.beginPath();
    ctx.moveTo(endx, endy);
    ctx.lineTo(endx-headlen*Math.cos(angle-Math.PI/7),endy-headlen*Math.sin(angle-Math.PI/7));

    //path from the side point of the arrow, to the other side point
    ctx.lineTo(endx-headlen*Math.cos(angle+Math.PI/7),endy-headlen*Math.sin(angle+Math.PI/7));

    //path from the side point back to the tip of the arrow, and then again to the opposite side point
    ctx.lineTo(endx, endy);
    ctx.lineTo(endx-headlen*Math.cos(angle-Math.PI/7),endy-headlen*Math.sin(angle-Math.PI/7));

    //draws the paths created above
    ctx.strokeStyle = "#cc0000";
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.fillStyle = "#cc0000";
    ctx.fill();
  }

  // Draw all grids and block connections
  redraw() {
    this.clearCanvas()
    this.drawGrid()
    const getCenter = (block) => ({
        x: block.loc.x + block.element.getBoundingClientRect().width/2,
        y: block.loc.y + block.element.getBoundingClientRect().height/2
    })

    this.blocks.forEach( block => {
      if (block.next)
        this.drawArrow(
          getCenter(block),
          getCenter(this.blocks[block.next])
        )
    })
  }


  // Clear drawings from canvas
  clearCanvas() {
    const ctx = this.element.getContext("2d")
    ctx.clearRect(0, 0, this.element.width, this.element.height)
  }

  addBlock(block) {
    this.container.appendChild(block.element);
    this.blocks.push(block);
  }

  getBlockForElement(elm){
    return this.blocks.find( block => block.element === elm )
  }

  clearBlockHighlight() {
    this.blocks.forEach(block => block.removeHighlight());
  }

  clear() {
    this.blocks.forEach(block => block.element.remove());
    this.blocks = [];
    this.redraw()
  }
}
module.exports = Canvas;
