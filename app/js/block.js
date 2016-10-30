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

    this.moving = false
    this.moveListener = undefined
    this.element.addEventListener('click', e => {
      if (this.moving){ this.disableMoving() }
      else if (this.element.classList.contains('active')){ this.enableMoving(e); }
    }) 
  }

  toggleHighlight() {
    this.element.classList.toggle('active');
  }

  removeHighlight(){
    this.element.classList.remove('active');
  }

/*
 * Enables blocks to be moved on the canvas.
 */
  enableMoving(e){
    // Don't allow another listener to be added if block is already moving.
    if (!this.moving){
      const origin = { x: e.clientX, y: e.clientY }
  
      const newX = (e) => Number(this.element.style.left.replace("px", "")) + e.clientX - origin.x
      const newY = (e) => Number(this.element.style.top.replace("px", "")) + e.clientY - origin.y
  
      this.moveListener = e => {
          setPositionToCoords(this.element, newX(e), newY(e)); 
          origin.x = e.clientX;
          origin.y = e.clientY;
      }

      this.element.addEventListener('mousemove', this.moveListener)
      this.moving = true
    } else {
      console.log("Attempted to move block that was already moving: " + JSON.stringify(this))
    }
  }

  disableMoving(){
    this.element.removeEventListener('mousemove', this.moveListener)
    this.moveListener = undefined
    this.moving = false
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
