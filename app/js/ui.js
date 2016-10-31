//
// ui.js
//
// Handles various ui based calls and events.
//
const blocks = require('./block.js');
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
        const x = event.layerX;
        const y = event.layerY;
        const blockType = blocks.TemplateBlock.dragged.getAttribute('data-type');
        let block;
        switch (blockType) {
          case 'Loop':
            block = new blocks.LoopBlock(x, y);
            break;
          case 'Conditional':
            block = new blocks.ConditionalBlock(x, y);
            break;
          case 'Variable':
            block = new blocks.VariableBlock(x, y);
            break;
          default:
            throw new TypeError('Unrecognized block type');
        }
        this.canvas.addBlock(block);
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
    const templateBlocks = document.querySelectorAll('.block.template');
    for (let i = 0; i < templateBlocks.length; i++) {
      const block = templateBlocks[i];
      this.templateBlocks.push(new blocks.TemplateBlock(block));
    }
  }

}


const controller = new Controller();
controller.initCanvas();
controller.initTemplateBlocks();
