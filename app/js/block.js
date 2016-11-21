//
// block.js
//
// Defines the Block class and subclasses
//


class TemplateBlock {
  /**
   * TemplateBlock represents a template from which to create a real block.
   * @param element {Element} a reference to element in the DOM that holds the template block
   */
  constructor(element) {
    this.uid = TemplateBlock.uid++;
    this.element = element;
    this.element.addEventListener('dragstart', TemplateBlock.dragStart, false);
    this.element.addEventListener('dragend', TemplateBlock.dragEnd, false);
    this.element.addEventListener('dragover', TemplateBlock.dragOver, false);
  }
}
module.exports.TemplateBlock = TemplateBlock;

/**
 * Maintains a count of the number of TemplateBlocks created
 * @static
 */
TemplateBlock.uid = 0;
/**
 * A reference to the TemplateBlock Element that is currently being dragged
 * @static
 */
TemplateBlock.dragged = undefined;
/**
 * Tracks the offset from dragging a TemplateBlock
 * @static
 */
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
 * Reset the static variables when the drag event finishes
 * @static
 */
TemplateBlock.dragEnd = () => {
  TemplateBlock.dragged = undefined;
  TemplateBlock.draggedOffset.x = 0;
  TemplateBlock.draggedOffset.y = 0;
};

/**
 * Prevents a block from being dragged over another block
 * @static
 * @returns {bool}
 */
TemplateBlock.dragOver = (event) => {
  event.preventDefault();
  event.stopPropagation();
  return false;
};


/**
 * Helper function to update the position of a block
 * @param node {Element} a reference to block to move
 * @param x {int} location on the x-axis in pixels
 * @param y {int} location on the y-axis in pixels
 */
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
module.exports.setPositionToCoords = setPositionToCoords;


/**
 * @abstract
 */
class Block {
  /**
   * Create a new Block object
   * @param x {int} location on the x-axis
   * @param y {int} location on the y-axis
   * @throws {TypeError} if a Block is directly instantiated
   */
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

  /**
   * Toggle the 'active' class on the block
   */
  toggleSelect() {
    this.element.classList.toggle('active');
  }

  /**
   * Removes the 'active' class on the block
   */
  removeHighlight() {
    this.element.classList.remove('active');
  }

  /**
   * Update the block's position in the DOM
   * @param x {int} new location on the x-axis
   * @param y {int} new location on the y-axis
   */
  updatePosition(x, y) {
    this.element.style.position = 'absolute';
    this.element.style.top = `${y}px`;
    this.element.style.left = `${x}px`;
    this.loc = { x, y };
  }

  /**
   * Returns the names and current values of the parameters for the block
   * @throws {TypeError} if this method is not implemented in a subclass
   * @virtual
   */
  getParamsMeta() {
    throw new TypeError(`Block ${this.uid}: Not implemented`);
  }

  /**
   * Sets a parameter to a value
   * @param param {string} name of the parameter
   * @param value {string} value to the paramter to
   */
  setParam(param, value) {
    this[param] = value;
  }

  /**
   * Returns an object representating the current state of the Block
   * @throws {TypeError} if this method is not implemented in a subclass
   * @virtual
   * @returns {Object} representation of the Block
   */
  toJSON() {
    throw new TypeError(`Block ${this.uid}: Not implemented`);
  }
}
module.exports.Block = Block;

/**
 * Counts the number of Blocks to give each one a unique id
 * @static
 */
Block.uid = 0;

/**
 * @static
 */
Block.dragStart = (event) => {
  event.preventDefault();
  // Add ability to link blocks from here later.
};


/**
 * Represents a starting block
 * @extends {Block}
 */
class StartBlock extends Block {
  /**
   * @returns {Object} the names and current values of the parameters
   */
  getParamsMeta() {
    return {};
  }

  /**
   * @returns {Object} a representation of the current state of the block
   */
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
  /**
   * Represents a loop block
   * @param x {int} location on the x-axis
   * @param y {int} location on the y-axis
   */
  constructor(x, y) {
    super(x, y);
    this.type = 'loop';
    this.children = [];
    this.condition = null;
  }

  /**
   * @returns {Object} the names and current values of the parameters
   */
  getParamsMeta() {
    return {
      condition: this.condition,
    };
  }

  /**
   * @returns {Object} a representation of the current state of the block
   */
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
  /**
   * Represents a conditional block
   * @param x {int} location on the x-axis
   * @param y {int} location on the y-axis
   */
  constructor(x, y) {
    super(x, y);
    this.type = 'conditional';
    this.condition = null;
    this.onTrue = null;
    this.onFalse = null;
  }

  /**
   * @returns {Object} the names and current values of the parameters
   */
  getParamsMeta() {
    return {
      condition: this.condition,
      onTrue: this.onTrue,
      onFalse: this.onFalse,
    };
  }

  /**
   * @returns {Object} a representation of the current state of the block
   */
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
  /**
   * Represents a variable block
   * @param x {int} location on the x-axis
   * @param y {int} location on the y-axis
   */
  constructor(x, y) {
    super(x, y);
    this.name = null;
  }

  /**
   * @returns {Object} the names and current values of the parameters
   */
  getParamsMeta() {
    return {
      name: this.name,
    };
  }

  /**
   * @returns {Object} a representation of the current state of the block
   */
  toJSON() {
    return {
      next: this.next,
      type: 'variable',
      loc: this.loc,
      attributes: {
        name: this.name,
      },
    };
  }
}
module.exports.VariableBlock = VariableBlock;


class PinWriteBlock extends Block {
  /**
   * Represents a pin write block
   * @param x {int} location on the x-axis
   * @param y {int} location on the y-axis
   */
  constructor(x, y) {
    super(x, y);
    this.type = 'pin_write';
    this.pin = null;
    this.value = null;
  }

  /**
   * @returns {Object} the names and current values of the parameters
   */
  getParamsMeta() {
    return {
      pin: this.pin,
      value: this.value,
    };
  }

  /**
   * @returns {Object} a representation of the current state of the block
   */
  toJSON() {
    return {
      next: this.next,
      type: this.type,
      loc: this.loc,
      attributes: {
        pin: this.pin,
        value: this.value,
      },
    };
  }
}
module.exports.PinWriteBlock = PinWriteBlock;


class PinReadBlock extends Block {
  /**
   * Represents a pin read block
   * @param x {int} location on the x-axis
   * @param y {int} location on the y-axis
   */
  constructor(x, y) {
    super(x, y);
    this.type = 'pin_read';
    this.pin = null;
    this.var = null;
  }

  /**
   * @returns {Object} the names and current values of the parameters
   */
  getParamsMeta() {
    return {
      pin: this.pin,
      var: this.var,
    };
  }

  /**
   * @returns {Object} a representation of the current state of the block
   */
  toJSON() {
    return {
      next: this.next,
      type: this.type,
      loc: this.loc,
      attributes: {
        pin: this.pin,
        var: this.var,
      },
    };
  }
}
module.exports.PinReadBlock = PinReadBlock;


class CodeBlock extends Block {
  /**
   * Represents a code block
   * @param x {int} location on the x-axis
   * @param y {int} location on the y-axis
   */
  constructor(x, y) {
    super(x, y);
    this.type = 'code';
    this.code = null;
  }

  /**
   * @returns {Object} the names and current values of the parameters
   */
  getParamsMeta() {
    return {
      code: this.code,
    };
  }

  /**
   * @returns {Object} a representation of the current state of the block
   */
  toJSON() {
    return {
      next: this.next,
      type: this.type,
      loc: this.loc,
      attributes: {
        code: this.code,
      },
    };
  }
}
module.exports.CodeBlock = CodeBlock;


class SleepBlock extends Block {
  /**
   * Represents a sleep block
   * @param x {int} location on the x-axis
   * @param y {int} location on the y-axis
   */
  constructor(x, y) {
    super(x, y);
    this.type = 'sleep';
    this.length = null;
  }

  /**
   * @returns {Object} the names and current values of the parameters
   */
  getParamsMeta() {
    return {
      length: this.length,
    };
  }

  /**
   * @returns {Object} a representation of the current state of the block
   */
  toJSON() {
    return {
      next: this.next,
      type: this.type,
      loc: this.loc,
      attributes: {
        length: this.length,
      },
    };
  }
}
module.exports.SleepBlock = SleepBlock;
