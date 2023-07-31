const segment = document.getElementById('segment');
const saveBtn = document.getElementById('button');
const mergeBtn = document.getElementById('button-merge');
const clearBtn = document.getElementById('button-clear');
const input = document.getElementById('blockLength');
const blockColor = document.getElementById('blockColor');
let blocks = [];

const sumBlocks = () => blocks.reduce((a, b) => a + b.value + b.emptySpace, 0)
const sumAllEmpty = () => blocks.reduce((a, b) => a + b.emptySpace, 0)

const findSpace = (newItem) => {
    for (const block of blocks ) {
        if(block.emptySpace === newItem) {
            return block;
        }

        if ( block.emptySpace > newItem ) {
            return block;
        }

        if(block.emptySpace) {
            return block;
        }
    }

    return null;
}

const uniqueId = () => {
    const dateString = Date.now().toString(36);
    const randomness = Math.random().toString(36).substr(2);
    return dateString + randomness;
};

function addBlock(newBlockWidth, blockColor, searchID) {
    newBlockWidth = parseInt(newBlockWidth, 10);
    const sumAllWithes = sumBlocks();
    const emptySpace = sumAllEmpty();

    if(!searchID) {
        searchID = uniqueId()
    }

    if (isNaN(newBlockWidth) || newBlockWidth <= 0) {
        alert('Enter the correct block length (positive integer)');
        return;
    }

    if( sumAllWithes + newBlockWidth - emptySpace > 1000) {
        alert(`You have exceeded the segment limit by ${sumAllWithes + newBlockWidth - emptySpace - 1000}!`);
        return;
    }

    const timestamp = String(new Date().getTime()) + Math.round(Math.random() * 100);

    let newItem = {id: timestamp, value: 0, left: 0, emptySpace: 0, blockColor: '#58c7fa', uid: searchID};
    let leftedWidth = 0;
    if ( blocks.length > 0 ) {
        newItem.value = newBlockWidth;

        const emptyBlock = findSpace(newBlockWidth);

        if(emptyBlock) {
            if(emptyBlock.emptySpace < newBlockWidth) {
                newItem.value = emptyBlock.emptySpace;
                leftedWidth = newBlockWidth - emptyBlock.emptySpace;
            }
            newItem.left = emptyBlock.left;
            newItem.blockColor = emptyBlock.blockColor;
            emptyBlock.emptySpace -= newItem.value
            emptyBlock.left += newItem.value

            blocks.splice(blocks.indexOf(emptyBlock), 0, newItem);

            if(!emptyBlock.emptySpace) {
                blocks.splice(blocks.indexOf(emptyBlock), 1);
            }
        } else {
            newItem.left = sumAllWithes;
            newItem.blockColor = blockColor;
            blocks.push(newItem);
        }

    } else {
        newItem.id = timestamp;
        newItem.value = newBlockWidth;
        newItem.blockColor = blockColor;
        blocks.push(newItem);
    }
    if(leftedWidth) {
        addBlock(leftedWidth, blockColor, searchID);
    }
    updateSegment();
}

function mergeEmptySpaces(block) {
    const index = blocks.indexOf(block);

    if(index < blocks.length - 2 && blocks[index+1].emptySpace) {
        block.emptySpace += blocks[index+1].emptySpace;
        blocks.splice(index + 1, 1);
    }

    if(index > 0 && blocks[index-1].emptySpace) {
        block.emptySpace += blocks[index-1].emptySpace;
        block.left = blocks[index-1].left;
        blocks.splice(index-1, 1);
    }
}

function removeLastEmptyElements() {
    if(blocks.length && blocks[blocks.length-1].emptySpace) {
        blocks.pop();
        removeLastEmptyElements();
    }
}

function removeElement (element) {
    element.addEventListener('dblclick', (e) => {
        const targetElement = e.target;
        const idTargetElement = targetElement.id;

        const blockID = blocks.findIndex(item => {
            return item.id === idTargetElement
        })

        blocks[blockID].emptySpace = blocks[blockID].value;
        blocks[blockID].value = 0;
        mergeEmptySpaces(blocks[blockID]);

        removeLastEmptyElements();

        updateSegment();
    });
}

function toggleActiveClass (element) {
    element.addEventListener('click', (e) => {
        const activeEl = e.target;
        const activeElUid = activeEl.attributes[3].nodeValue;

        let allItems = document.querySelectorAll(`[uid="${activeElUid}"]`);
        allItems.forEach(item => {
            item.classList.toggle('active');

            if(item.classList.contains('active')) {
                return item.style.background = item.getAttribute('color');
            }

            item.style.background = 'transparent';
        })
    })
}

function updateSegment() {
    segment.innerHTML = '';

    for (const block of blocks) {
        let node = document.createElement('div');

        if (block.value === 0) {
            continue
        }

        node.classList.add('block');
        node.style.width = `${block.value}px`;
        node.style.left = `${block.left}px`;
        node.setAttribute('id', block.id);
        node.setAttribute('color', block.blockColor);
        node.setAttribute('uid', block.uid);
        node.textContent = block.value;

        segment.appendChild(node);
        removeElement(node);
        toggleActiveClass(node);
    }
}

function mergeBlocks() {
    let removeItem = [];

    for(let i = 0; i < blocks.length; i++) {
        for(let k = i + 1; k < blocks.length; k++) {
            if(blocks[i].uid === blocks[k].uid) {
                blocks[i].value += blocks[k].value;

                for(let j = i + 1; j < k; j++) {
                    blocks[j].left += blocks[k].value;
                }

                removeItem.push(k);
            }
        }
    }

    removeItem.forEach(item => {
        blocks.splice(item, 1)
    })
    updateSegment();
}

function clearSegment() {
    blocks = [];
    updateSegment();
}

saveBtn.addEventListener('click', (e) => {
    e.preventDefault();
    addBlock(input.value, blockColor.value);
});

mergeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    mergeBlocks();
})

clearBtn.addEventListener('click', (e) => {
    e.preventDefault();
    clearSegment();
})

