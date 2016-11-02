//
// ui.js
//
// Handles various ui based calls and events.
//
const blocks = require('./block.js');
const Canvas = require('./canvas.js');

/*
 * Helper functions
 */

const setPositionToCoords = (node, x, y) => {
  node.style.position = 'absolute';
  node.style.top = `${y}px`;
  node.style.left = `${x}px`;
};


/*
 * Controller Class
 */

class Controller {

  constructor() {
    this.canvas = undefined;
    this.templateBlocks = [];
    this.activeBlock = undefined;
    // This is a wrapper to protect against changing this context.
    //   Needs to be a variable to allow for proper event listener removal.
    //   Needs to be an instance variable since the enableMoving calls needs the instance.
    this.enableMovingListener = () => this.enableMoving();
    // Need a wrapper for this guy too.
    document.getElementById('config-bar-header')
      .addEventListener('click', () => this.toggleConfigBar(), false);
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

    document.getElementById('chart-container').addEventListener('click',
      () => this.unselectBlock(), false);
  }

  initTemplateBlocks() {
    const templateBlocks = document.querySelectorAll('.block.template');
    for (let i = 0; i < templateBlocks.length; i++) {
      const block = templateBlocks[i];
      this.templateBlocks.push(new blocks.TemplateBlock(block));
    }
  }

  // Removes highlighting, disables moving, and removes listeners.
  unselectBlock() {
    if (this.activeBlock) {
      this.activeBlock.removeHighlight();
      this.activeBlock.element.getElementsByTagName("header")[0].
        removeEventListener('mousedown', this.enableMovingListener);
      this.disableMoving();
      this.activeBlock = undefined;
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

    const selectBlock = (e) => {
      // We we are changing the active block unhighlight the old block and update
      //   the move listener.

      if (e) { e.stopPropagation(); } // Prevents clicking from dismissing the block.
      if (this.activeBlock === block) {
        return;
      } else if (this.activeBlock && this.activeBlock !== block) {
        this.unselectBlock();
      }

      this.activeBlock = block;
      block.element.getElementsByTagName("header")[0].addEventListener('mousedown',
        this.enableMovingListener, false);
      block.toggleSelect();

      // Update config bar based on current selection.
      document.getElementById('config-bar')
        .getElementsByTagName('content')[0]
        .innerHTML = this.activeBlock.getParamsMeta();
    };

    block.element.addEventListener('click', selectBlock, false);

    // If config bar is closed open it.
    if (!this.configBarActive) { this.toggleConfigBar(); }
    selectBlock();
  }

  toggleConfigBar() {
    this.configBarActive = !this.configBarActive;
    document.body.classList.toggle('show-config-bar');
  }

/*
 * Enables blocks to be moved on the canvas.
 */

  enableMoving() {
    // Don't allow another listener to be added if block is already moving.
    if (!this.moveListener && this.activeBlock) {
      // Although nasty it is important to leave these as funcitons so they
      //   update when the mouse moves this allows tracking even when the
      //   user scrolls, otherwise we take a snapshot of the offsets with
      //   the current scroll bounds which leads to incorrect movement.
      const cvs = this.canvas.element;
      // Since the block bounds doesn't change we don't need to worry about that here.
      const blockBounds = this.activeBlock.element.getBoundingClientRect();
      const newX = e => e.pageX - cvs.getBoundingClientRect().left - blockBounds.width/2;
      const newY = e => e.pageY - cvs.getBoundingClientRect().top - blockBounds.height/4;

      this.moveListener = (e) => {
        if (e.buttons === 1) setPositionToCoords(this.activeBlock.element, newX(e), newY(e));
        else this.disableMoving();
      };

      document.getElementById('chart-container').addEventListener('mousemove', this.moveListener);
    } else {
      console.log(`Attempted to move block that was already moving, or when one wasn't selected: ${
        JSON.stringify(this)}`);
    }
  }

  disableMoving() {
    document.getElementById('chart-container').removeEventListener('mousemove', this.moveListener);
    document.getElementById('chart-container').removeEventListener('mouseup', this.disableMoveListener);
    this.moveListener = undefined;
    this.disableMoveListener = undefined;
  }

}

window.controller = new Controller();
window.controller.initCanvas();
window.controller.initTemplateBlocks();
