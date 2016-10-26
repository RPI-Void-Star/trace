//
// ui.js
//
// Handles various ui based calls and events.
//
const TemplateBlock = require('./block.js').TemplateBlock;
const Canvas = require('./canvas.js');

const blocks = document.querySelectorAll('.block.template');
for (let i = 0; i < blocks.length; i++) {
  const block = blocks[i];
  const tb = new TemplateBlock(block);
}

const canvas = new Canvas(document.getElementById('chart-canvas'),
                          document.getElementById('chart-container'));
