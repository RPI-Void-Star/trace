//
// unit tests for app/js/block.js
//
/* global describe, it */

const chai = require('chai');
const Block = require('../../../app/js/block.js');

const expect = chai.expect;

function initTemplateBlockHTML() {
  const fixture = '<div class="block template" draggable="true" data-type="loop"> \
      <header>Loop</header> </div>';
  document.body.insertAdjacentHTML('afterbegin', fixture);
}

describe('TemplateBlock', () => {
  it('should be created from an HTML element', () => {
    initTemplateBlockHTML();
    const elem = document.getElementsByClassName('template');
    const tb = new Block.TemplateBlock(elem[0]);
    expect(tb);
  });
});

describe('Block', () => {
  it('should be created from the dragged template', () => {
    initTemplateBlockHTML();
    const elem = document.getElementsByClassName('template');
    const tb = new Block.TemplateBlock(elem[0]);
    expect(tb);
    Block.TemplateBlock.dragged = elem[0];
    Block.TemplateBlock.draggedOffset.x = 0;
    Block.TemplateBlock.draggedOffset.y = 0;
    const b = new Block.LoopBlock(0, 0);
    expect(b);
  });

  it('should be moveable', () => {
    initTemplateBlockHTML();
    const elem = document.getElementsByClassName('template')[0];
    const newx = 50;
    const newy = 100;
    Block.setPositionToCoords(elem, newx, newy);
    expect(elem.style.left).to.be.equal(`${newx}px`);
    expect(elem.style.top).to.be.equal(`${newy}px`);
  });
});
