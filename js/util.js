'use strict'
function createCell(isMine) {
    return {
        minesAroundCount: 0,
        isShown: false,
        isMine: isMine,
        isMarked: false
    }
}

function countMinesAround(board, rowIdx, colIdx) {
    var minesCount = 0

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {

            if (j < 0 || j >= board[i].length) continue
            if (i === rowIdx && j === colIdx) continue

            var currCell = board[i][j]
            // console.log('currCell: ', currCell)
            if (currCell.isMine === true) minesCount++
        }
    }
    return minesCount
}

function setLevel(size, amountOfMines) {
    gLevel.SIZE = size
    gLevel.MINES = amountOfMines
    console.log(gLevel)
    init()
}


function resetgGame() {
    return gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        gameLost: false

    }
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}