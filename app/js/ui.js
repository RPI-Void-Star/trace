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
    this.activeBlock = undefined;
    document.getElementById('config-bar-header')
      .addEventListener('click', this.toggleConfigBar, false);
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
        this.createBlock(blockType, x, y);
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

  createBlock(blockType, x, y) {
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
    const selectBlock = () => {
      if (this.activeBlock) {
        this.activeBlock.toggleSelect();
      }
      block.toggleSelect();
      this.activeBlock = block;
      document.getElementById('config-bar')
        .getElementsByTagName('content')[0]
        .innerHTML = this.activeBlock.getParamsMeta();
    };
    block.element.addEventListener('click', selectBlock, false);
    this.configBarActive = false;
    this.toggleConfigBar();
    selectBlock();
  }

  toggleConfigBar() {
    const configBar = document.getElementById('config-bar');
    const configContent = document.getElementById('config-bar').getElementsByTagName('content')[0];
    const mainWindow = document.getElementsByTagName('main')[0];
    const viewportWidth = document.documentElement.clientWidth;
    if (this.configBarActive) {
      configBar.style.width = '55px';
      mainWindow.style.width = `${viewportWidth - 300 - 55}px`;
      configContent.style.opacity = 0;
      this.configBarActive = false;
    } else {
      configBar.style.width = '300px';
      mainWindow.style.width = `${viewportWidth - 300 - 300}px`;
      configContent.style.opacity = 1;
      this.configBarActive = true;
    }
  }

}


const controller = new Controller();
controller.initCanvas();
controller.initTemplateBlocks();
