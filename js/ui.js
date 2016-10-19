//
// ui.js
//
// Handles various ui based calls and events.
//

let dragged = undefined
const templateBlockDragged = (event) => {
      // store a ref. on the dragged elem
      dragged = event.target;
      // make it half transparent
      event.target.style.opacity = 1;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/html', this.innerHTML);
}

const blockDropped = (event) => {
    event.preventDefault()
    event.stopPropagation()
    // move dragged elem to the selected drop target
    if ( event.target === document.querySelector("#chart-container") ) {
        event.target.style.background = "";
        dragged.parentNode.removeChild( dragged );
        event.target.appendChild( dragged );
    }
    return false
}

let blocks = document.querySelectorAll(".block")
for (let i = 0; i < blocks.length; i++){
    const block = blocks[i]
    block.addEventListener("dragstart", templateBlockDragged, false);
    block.addEventListener("dragend", e => false, false);
    block.addEventListener("dragover", e => {
        e.preventDefault()
        e.stopPropagation()
        return false
    }, false);
    block.addEventListener("drop", blockDropped, false);
}


document.getElementById("chart-container").addEventListener("dragstart", templateBlockDragged, false);
document.getElementById("chart-container").addEventListener("drop", blockDropped, false);
document.getElementById("chart-container").addEventListener("dragover",  e => {
    e.preventDefault()
    e.stopPropagation()
    return false
}, false);
document.getElementById("chart-container").addEventListener("dragend", e => false, false);
