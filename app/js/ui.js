//
// ui.js
//
// Handles various ui based calls and events.
//
const TemplateBlock = require('./block.js').TemplateBlock;
const Canvas = require('./canvas.js');


class Controller {

  constructor() {
    this.canvas = undefined;
    this.templateBlocks = [];
  }

  initCanvas() {
    this.canvas = new Canvas(document.getElementById('chart-canvas'),
                             document.getElementById('chart-container'));
    window.onresize = () => this.canvas.updateCanvas();

    this.canvas.container.addEventListener('drop', (event) => {
      // Detects when blocks are dropped onto the canvas and adds a copy of the block.
      event.preventDefault();
      event.stopPropagation();
      // move dragged elem to the selected drop target
      if (this.canvas.container === event.target) {
        this.canvas.addBlock(event.layerX, event.layerY);
      }
      return false;
    }, false);

    this.canvas.container.addEventListener('dragover', (event) => {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }, false);
  }

  initTemplateBlocks() {
    const blocks = document.querySelectorAll('.block.template');
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      this.templateBlocks.push(new TemplateBlock(block));
    }
  }

}


const controller = new Controller();
controller.initCanvas();
controller.initTemplateBlocks();
