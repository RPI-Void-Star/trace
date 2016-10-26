//
// block.js
//
// Defines the Block class and subclasses
//


class TemplateBlock {

  constructor(element) {
    this.uid = TemplateBlock.uid++;
    this.element = element;
    this.element.addEventListener('dragstart', TemplateBlock.dragStart, false);
    this.element.addEventListener('dragend', TemplateBlock.dragEnd, false);
    this.element.addEventListener('dragover', TemplateBlock.dragOver, false);
  }

}
module.exports.TemplateBlock = TemplateBlock;

TemplateBlock.uid = 0;
TemplateBlock.dragged = undefined;
TemplateBlock.draggedOffset = { x: 0, y: 0 };

/**
 * Clones the template block into the destination.
 * @static
 */
TemplateBlock.dragStart = (event) => {
  // store a ref. on the dragged elem
  TemplateBlock.dragged = event.target;
  TemplateBlock.draggedOffset.x = event.layerX;
  TemplateBlock.draggedOffset.y = event.layerY;
  // make it half transparent
  event.dataTransfer.effectAllowed = 'copy';
  event.dataTransfer.setData('text/html', this.innerHTML);
};

/**
 * @static
 */
TemplateBlock.dragEnd = () => {
  TemplateBlock.dragged = undefined;
  TemplateBlock.draggedOffset.x = 0;
  TemplateBlock.draggedOffset.y = 0;
};

/**
 * @static
 */
TemplateBlock.dragOver = (event) => {
  event.preventDefault();
  event.stopPropagation();
  return false;
};


const setPositionToCoords = (node, x, y) => {
  node.style.position = 'absolute';
  node.style.top = `${y}px`;
  node.style.left = `${x}px`;
};


class Block {

  constructor(x, y) {
    this.uid = Block.uid++;
    this.element = TemplateBlock.dragged.cloneNode(true);
    setPositionToCoords(this.element, x - TemplateBlock.draggedOffset.x,
                        y - TemplateBlock.draggedOffset.y);
    this.element.classList.remove('template');
    this.element.addEventListener('dragstart', Block.dragStart);
  }

}

module.exports.Block = Block;

Block.uid = 0;

/**
 * @static
 */
Block.dragStart = (event) => {
  event.preventDefault();
  // Add ability to link blocks from here later.
};
