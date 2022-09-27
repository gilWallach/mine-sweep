'use strict'

function createBoard(size) {
    var mat = []

    for (var i = 0; i < size; i++) {
        mat[i] = []
        for (var j = 0; j < size; j++) {
            mat[i].push(createCell(false))
        }
    }
    return mat
}

function createCell(isMine) {
    var cell
    return cell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: isMine,
        isMarked: false
    }
}

function addMines(mat, i, j) {
    for (var k = 0; k < gLevel.MINES; k++) {
        var rndI = getRandomIntInclusive(0, gLevel.SIZE - 1)
        var rndJ = getRandomIntInclusive(0, gLevel.SIZE - 1)
        var rndIdxIsNeg = isNeg(i, j, rndI, rndJ)

        if (!mat[rndI][rndJ].isShown &&
            !mat[rndI][rndJ].isMine &&
            rndIdxIsNeg === false) {
            mat[rndI][rndJ].isMine = true
        } else k--
    }
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var minesAroundCount = countMinesAround(board, i, j)
            var currCell = board[i][j]

            if (minesAroundCount !== 0)
                currCell.minesAroundCount += minesAroundCount
        }
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
            if (currCell.isMine === true) minesCount++
        }
    }
    return minesCount
}

function showTimer() {
    if (gGame.isOn) {
        var timer = document.querySelector('.timer span')
        var start = Date.now()

        gtimerInterval = setInterval(function () {
            var currTs = Date.now()

            var secs = parseInt((currTs - start) / 1000)
            var ms = (currTs - start) - secs * 1000
            ms = '000' + ms
            ms = ms.substring(ms.length - 3, ms.length)

            timer.innerText = `${secs}.${ms}`
        }, 100)
    }
}

function isNeg(cellI, cellJ, negI, negJ) {
    if ((negI === cellI + 1 && negJ === cellJ) ||
        (negI === cellI + 1 && negJ === cellJ + 1) ||
        (negI === cellI + 1 && negJ === cellJ - 1) ||
        (negI === cellI && negJ === cellJ + 1) ||
        (negI === cellI && negJ === cellJ - 1) ||
        (negI === cellI - 1 && negJ === cellJ) ||
        (negI === cellI - 1 && negJ === cellJ + 1) ||
        (negI === cellI - 1 && negJ === cellJ - 1)) return true
    else return false
}

function setLevel(size, amountOfMines) {
    gLevel.SIZE = size
    gLevel.MINES = amountOfMines
    
    // set highscore per level
    if (size === 4) {
        document.querySelector('.highscore span').innerText = `${gHighscoreLvl1} 🏆`
    }
    else if (size === 8) {
        document.querySelector('.highscore span').innerText = `${gHighscoreLvl2} 🏆`
    }
    else if (size === 12) {
        document.querySelector('.highscore span').innerText = `${gHighscoreLvl3} 🏆`
    }

    init()
}


function resetgGame() {
    return gGame = {
        isOn: false,
        gameLost: false,
        gameWon: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: 3,
        isHint: false,
        hintsCount: 3,
        safeClicksCount: 3,

    }
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}