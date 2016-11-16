//
// ui.js
//
// Handles various ui based calls and events.
//
const blocks = require('./block.js');
const Canvas = require('./canvas.js');
const { dialog } = require('electron').remote;
const { ipcRenderer } = require('electron');

/*
 * Controller Class
 */

class Controller {

  constructor() {
    this.canvas = undefined;
    this.templateBlocks = [];
    this.activeBlock = undefined;
    this.fileSavePath = undefined;
    // This is a wrapper to protect against changing this context.
    //   Needs to be a variable to allow for proper event listener removal.
    //   Needs to be an instance variable since the enableMoving calls needs the instance.
    this.enableMovingListener = () => this.enableMoving();
    // Need a wrapper for this guy too.
    document.getElementById('config-bar-header')
      .addEventListener('click', () => this.toggleConfigBar(), false);

    // Project management buttons
    document.getElementById('new-project').addEventListener('click', () => this.newProject(), false);
    document.getElementById('open-project').addEventListener('click', () => this.openProject(), false);
    document.getElementById('save-project').addEventListener('click', () => this.saveProject(), false);
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

    this.newProject();
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
      this.activeBlock.element.getElementsByTagName('header')[0]
        .removeEventListener('mousedown', this.enableMovingListener);
      this.disableMoving();
      this.activeBlock = undefined;
    }
  }

  createBlock(blockType, x, y) {
    let block;
    switch (blockType) {
      case 'start':
        block = new blocks.StartBlock(x, y);
        break;
      case 'loop':
        block = new blocks.LoopBlock(x, y);

        block.element.addEventListener('drop', (event) => {
          // Detects when blocks are dropped onto the loop and adds a copy of the block.
          event.preventDefault();
          event.stopPropagation();
          // move dragged elem to the selected drop target

          const type = blocks.TemplateBlock.dragged.getAttribute('data-type');
          const child = this.createBlock(type, 'auto', 'auto');
          block.children.push(child);
          block.element.classList.add('full');
          block.element.appendChild(child.element);

          return false;
        }, false);


        break;
      case 'conditional':
        block = new blocks.ConditionalBlock(x, y);
        break;
      case 'variable':
        block = new blocks.VariableBlock(x, y);
        break;
      case 'pin_write':
        block = new blocks.PinWriteBlock(x, y);
        break;
      case 'pin_read':
        block = new blocks.PinReadBlock(x, y);
        break;
      default:
        throw new TypeError(`Unrecognized block type: ${JSON.stringify(blockType)}`);
    }
    this.canvas.addBlock(block);

    const selectBlock = (e) => {
      // Prevents clicking from dismissing the block.
      if (e) { e.stopPropagation(); }

      // We are changing the active block unhighlight the old block and update
      //   the move listener.
      if (this.activeBlock === block) {
        return;
      } else if (this.activeBlock && this.activeBlock !== block) {
        this.unselectBlock();
      }

      this.activeBlock = block;
      block.toggleSelect();

      // Enable moving only if block has absolute position.
      if (x !== 'auto' && y !== 'auto') {
        block.element.getElementsByTagName('header')[0].addEventListener('mousedown',
          this.enableMovingListener, false);
      }

      // Remove the old config from view
      const configContainer = document.getElementById('config-bar')
          .getElementsByTagName('content')[0];
      while (configContainer.firstChild) {
        configContainer.removeChild(configContainer.firstChild);
      }
      // Update config bar based on current selection.
      const params = this.activeBlock.getParamsMeta();
      Object.keys(params).forEach((key) => {
        const container = document.createElement('div');
        container.classList.add('param');
        const label = document.createElement('label');
        const id = `block-${this.activeBlock.uid}-${key}`;
        label.setAttribute('for', id);
        label.innerText = key;
        const input = document.createElement('input');
        input.setAttribute('id', id);
        input.setAttribute('value', params[key] || '');
        input.addEventListener('change', () => {
          this.activeBlock.setParam(key, input.value);
        });
        container.appendChild(label);
        container.appendChild(input);
        configContainer.appendChild(container);
      });
    };

    block.element.addEventListener('click', selectBlock, false);

    // If config bar is closed open it.
    if (!this.configBarActive) { this.toggleConfigBar(); }
    selectBlock();
    return block;
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
      const newX = e => e.pageX - cvs.getBoundingClientRect().left - (blockBounds.width / 2);
      const newY = e => e.pageY - cvs.getBoundingClientRect().top - (blockBounds.height / 4);

      this.moveListener = (e) => {
        if (e.buttons === 1) this.activeBlock.updatePosition(newX(e), newY(e));
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

/*
 * Project Management
 */

  newProject() {
    if (this.canvas.blocks.length === 0 || window.confirm('Make a new project?\nYou will lose any unsaved work.')) {
      this.canvas.clear();
      this.fileSavePath = undefined;
      const bounds = this.canvas.element.parentNode.getBoundingClientRect();
      this.setProjectJSON(`{
        "blocks": [
            { "type": "start", "loc": { "x": ${(bounds.width / 2) - 100}, "y": ${(bounds.height / 2) - 40} } }
      ]}`);
      this.toggleConfigBar();
    }
  }

  getProjectJSON() {
    return JSON.stringify(this.canvas);
  }

  setProjectJSON(json) {
    const newChart = JSON.parse(json);
    newChart.blocks.forEach((block) => {
      const template = document.querySelector(`.template[data-type="${block.type}"`);
      blocks.TemplateBlock.dragged = template;
      const newBlock = this.createBlock(block.type, block.loc.x, block.loc.y);
      newBlock.attributes = block.attributes;
      newBlock.next = block.next;
    });
  }

  openProject() {
    const files = dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Trace Files', extensions: ['trc'] }],
    });

    if (files && files[0]) {
      const res = ipcRenderer.sendSync('load-file', { filename: files[0] });

      // If open was successful set fileSavePath.
      if (!res.err && res.data) {
        this.fileSavePath = files[0];
        const rawjson = res.data.data.map(chr => String.fromCharCode(chr)).join('');

        // Redraw the canvas
        this.canvas.clear();
        this.setProjectJSON(rawjson);
      } else throw res.err;
    }
  }

  saveProject() {
    if (!this.fileSavePath) {
      const fileLocation = dialog.showSaveDialog({
        properties: ['openFile'],
        filters: [{ name: 'Trace Files', extensions: ['trc'] }],
      });
      if (fileLocation) {
        this.fileSavePath = fileLocation;
        console.log(this.fileSavePath);
      } else {
        // User hit cancel, ignore save request.
        return;
      }
    }

    // Actually save the file.
    const res = ipcRenderer.sendSync('save-file', {
      filename: this.fileSavePath,
      data: this.getProjectJSON(),
    });
    if (res.err) throw res.err;
  }
}

window.controller = new Controller();
window.controller.initCanvas();
window.controller.initTemplateBlocks();
