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
  event.dataTransfer.setData('text/html', event.target.outerHTML);
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
  // Ignore updates to auto positioned nodes, throw error
  //  if position is not a number.
  function PosException(message) {
    this.message = message;
    this.name = 'PosException';
  }

  if (!isNaN(x) && !isNaN(y)) {
    node.style.position = 'absolute';
    node.style.top = `${y}px`;
    node.style.left = `${x}px`;
  } else if (x !== 'auto' || y !== 'auto') {
    throw new PosException(`Invalid x, y, position: ${x} ${y}`);
  }
};


/**
 * @abstract
 */
class Block {

  constructor(x, y) {
    if (new.target === Block) {
      throw new TypeError('Cannot construct Block instances directly');
    }
    this.uid = Block.uid++;
    this.loc = { x, y };
    this.next = null;
    this.element = TemplateBlock.dragged.cloneNode(true);
    if (x !== 'auto' && y !== 'auto') {
      setPositionToCoords(this.element, x - TemplateBlock.draggedOffset.x,
        y - TemplateBlock.draggedOffset.y);
    }
    this.element.classList.remove('template');
    this.element.addEventListener('dragstart', Block.dragStart);
  }

  toggleSelect() {
    this.element.classList.toggle('active');
  }

  removeHighlight() {
    this.element.classList.remove('active');
  }

  updatePosition(x, y) {
    this.element.style.position = 'absolute';
    this.element.style.top = `${y}px`;
    this.element.style.left = `${x}px`;
    this.loc = { x, y };
  }

  /**
   * @virtual
   */
  getParamsMeta() {
    throw new TypeError(`Block ${this.uid}: Not implemented`);
  }

  setParam(param, value) {
    this[param] = value;
  }

  /**
   * @virtual
   */
  toJSON() {
    throw new TypeError(`Block ${this.uid}: Not implemented`);
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

class StartBlock extends Block {

  getParamsMeta() {
    return {};
  }

  toJSON() {
    return {
      next: this.next,
      type: 'start',
      loc: this.loc,
      attributes: {
      },
    };
  }

}
module.exports.StartBlock = StartBlock;

class LoopBlock extends Block {

  constructor(x, y) {
    super(x, y);
    this.type = 'loop';
    this.children = [];
    this.condition = null;
  }

  getParamsMeta() {
    return {
      condition: this.condition,
    };
  }

  toJSON() {
    return {
      next: this.next,
      type: this.type,
      loc: this.loc,
      attributes: {
        children: this.children,
      },
    };
  }

}
module.exports.LoopBlock = LoopBlock;


class ConditionalBlock extends Block {

  constructor(x, y) {
    super(x, y);
    this.type = 'conditional';
    this.condition = null;
    this.onTrue = null;
    this.onFalse = null;
  }

  getParamsMeta() {
    return {
      condition: this.condition,
      onTrue: this.onTrue,
      onFalse: this.onFalse,
    };
  }

  toJSON() {
    return {
      next: this.next,
      type: this.type,
      loc: this.loc,
      attributes: {
        condition: this.condition,
        children: {
          true: this.onTrue,
          false: this.onFalse,
        },
      },
    };
  }

}
module.exports.ConditionalBlock = ConditionalBlock;


class VariableBlock extends Block {

  constructor(x, y) {
    super(x, y);
    this.value = null;
  }

  getParamsMeta() {
    return `Block ${this.uid}: variable?!`;
  }

  toJSON() {
    return {
      next: this.next,
      type: 'variable',
      loc: this.loc,
      attributes: {
        value: this.value,
      },
    };
  }

}
module.exports.VariableBlock = VariableBlock;
