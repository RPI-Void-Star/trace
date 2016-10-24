//
// ui.js
//
// Handles various ui based calls and events.
//

let dragged;
const draggedOffset = { x: 0, y: 0 };
const templateBlockDragged = (event) => {
  // Clones the template block into the destination.

  // store a ref. on the dragged elem
  dragged = event.target;
  draggedOffset.x = event.layerX;
  draggedOffset.y = event.layerY;
  // make it half transparent
  event.dataTransfer.effectAllowed = 'copy';
  event.dataTransfer.setData('text/html', this.innerHTML);
};

const regularBlockDragged = (event) => {
  event.preventDefault();
  // Add ability to link blocks from here later.
};

const setPositionToCoords = (node, x, y) => {
  node.style.position = 'absolute';
  node.style.top = `${y}px`;
  node.style.left = `${x}px`;
};

const blockDropped = (event) => {
  // Detects when blocks are dropped onto the canvas
  //  and adds a copy of the block.
  event.preventDefault();
  event.stopPropagation();
  // move dragged elem to the selected drop target
  if (event.target === document.querySelector('#chart-container')) {
    const newBlock = dragged.cloneNode(true);
    setPositionToCoords(newBlock, event.layerX - draggedOffset.x, event.layerY - draggedOffset.y);
    newBlock.classList.remove('template');
    newBlock.addEventListener('dragstart', regularBlockDragged);
    event.target.appendChild(newBlock);
  }
  return false;
};

const templateBlockDragEnd = () => {
  dragged = undefined;
  draggedOffset.x = 0;
  draggedOffset.y = 0;
};

const blocks = document.querySelectorAll('.block.template');
for (let i = 0; i < blocks.length; i++) {
  const block = blocks[i];
  block.addEventListener('dragstart', templateBlockDragged, false);
  block.addEventListener('dragend', templateBlockDragEnd, false);
  block.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, false);
}


document.getElementById('chart-container').addEventListener('drop', blockDropped, false);
document.getElementById('chart-container').addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
  return false;
}, false);
