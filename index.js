/**
 * Expects JSON input on STDIN.
 * Outputs 3 lines: BOARD_SIZE, BOARD_SHAPE, and BOARD_CLUES. If given crossword JSON isn't compatible with their formats, errors instead.
 * BOARD_SIZE: a number which is at least as big as any number in BOARD_SHAPE
 *   Format for BOARD_SHAPE: one series of coordinates. Y is FIRST in BOARD_SHAPE only.
 *   Format for series of coordinates: zero or more coordinates seperated by spaces.
 *   Format for coordinates: exactly two decimal numbers seperated by a comma
 *   Format for BOARD_CLUES: zero or more clues, seperated by pipes ("|")
 *   Format for clue: one series of coordinates (with the additional restriction that any coordinates that appear here must also appear in BOARD_SHAPE), one ClueText, and 1 AnswerText, seperated by semicolons
 *   Format for ClueText: any text that does not contain a pipe or a semicolon
 *   Format for AnswerText: text that is 2 or more characters long, composed of alphanumeric characters and/or hyphens
 */


let json = "";
process.stdin.on("data", (d) => json += d.toString());

process.stdin.on("close", () => parseJsonAndTransform(json));


function parseJsonAndTransform(json) {
    let parsed = JSON.parse(json);

    let BOARD_SIZE = Math.max(parsed.size.rows, parsed.size.cols);

    let boardShapeCoordinates = getLetterCoordinates(parsed);

    guardAgainstNonUniqueClues(parsed);
    
    let acrossClues = getAcrossClues(parsed);
    
    let downClues = getDownClues(parsed);


    let BOARD_SHAPE = boardShapeCoordinates.join(" ");
    
    let BOARD_CLUES = (acrossClues.concat(downClues)).join("|");

    console.log(BOARD_SIZE);
    console.log(BOARD_SHAPE);
    console.log(BOARD_CLUES);

}

function getAcrossClues(parsed) {
    let gridJoined = parsed.grid.join("");
    
    let clues = [];
    
    for(let i = 0; i < parsed.answers.across.length; i++) {
        clues.push(findAcrossCluePositions(gridJoined, i, parsed));
    }
    
    return clues;
}

function getDownClues(parsed) {
    let gridTransposedJoined = "";
    for(let x = 0; x < parsed.size.cols; x++) {
        for(let y = 0; y < parsed.size.rows; y++) {
            gridTransposedJoined += parsed.grid[x + y * parsed.size.cols];
        }
    }
    
    console.log(gridTransposedJoined);
    
    let clues = [];

    for (let i = 0; i < parsed.answers.down.length; i++) {
        clues.push(findDownCluePositions(gridTransposedJoined, i, parsed));
    }

    return clues;
}


function findDownCluePositions(gridJoined, i, parsed, offsetSize) {
    offsetSize |= 0;

    let answer = parsed.answers.down[i];
    let index = gridJoined.indexOf(answer) + offsetSize;

    let clue = parsed.clues.down[i];

    if (index == -1) {
        console.error("Answer not in grid", answer);
        process.exit(-1);
    }

    if (!(/^[\w-]+$/.test(answer))) {
        console.error("Answer not alphanumeric/hyphen!");
        process.exit(-1);
    }

    if (clue.indexOf(";") != -1 || clue.indexOf("|") != -1) {
        console.error("Clue contains semi or pipe");
        process.exit(1);
    }

    let isInFirstRow = index % parsed.size.rows == 0;
    let isRightAfterBlock = gridJoined[index - 1] == ".";
    if (isInFirstRow || isRightAfterBlock) {
        let col = Math.floor(index / parsed.size.rows);
        let row = index % parsed.size.rows;

        let coords = [];
        for (let r = 0; r < answer.length; r++) {
            coords.push((col + 1) + "," + (row + r + 1));
        }

        return coords.join(" ") + ";" + clue + ";" + answer;
    } else {
        //must've stumbled upon a substring; try again
        return findDownCluePositions(gridJoined.substring(index + 1) - offsetSize, i, parsed, index + 1 - offsetSize);
    }
}


function findAcrossCluePositions(gridJoined, i, parsed, offsetSize) {
    offsetSize |= 0;
    
    let answer = parsed.answers.across[i];
    let index = gridJoined.indexOf(answer) + offsetSize;
    
    let clue = parsed.clues.across[i];
    
    if(index == -1) {
        console.error("Answer not in grid");
        process.exit(-1);
    }
    
    if(!(/^[\w-]+$/.test(answer))) {
        console.error("Answer not alphanumeric/hyphen!");
        process.exit(-1);
    }
    
    if (clue.indexOf(";") != -1 || clue.indexOf("|") != -1) {
        console.error("Clue contains semi or pipe");
        process.exit(1);
    }
    
    let isInFirstColumn = index % parsed.size.cols == 0;
    let isRightAfterBlock = gridJoined[index - 1] == ".";
    if(isInFirstColumn || isRightAfterBlock) {
        let row = Math.floor(index / parsed.size.cols);
        let col = index % parsed.size.cols;
        
        let coords = [];
        for(let c = 0; c < answer.length; c++) {
            coords.push((col + c + 1) + "," + (row + 1));
        }
        
        return coords.join(" ") + ";" + clue + ";" + answer;
    } else {
        //must've stumbled upon a substring; try again
        return findAcrossCluePositions(gridJoined.substring(index + 1) - offsetSize, i, parsed, index + 1 - offsetSize);
    }
}

function guardAgainstNonUniqueClues(parsed) {
    if (new Set(parsed.answers.across).size != parsed.answers.across.length ||
        new Set(parsed.answers.down).size != parsed.answers.down.length) {
        console.error("Non-unique answers");
        process.exit(1);
    }
}

function getLetterCoordinates(parsed) {
    let coords = [];

    for (let i = 0; i < parsed.grid.length; i++) {
        let row = Math.floor(i / parsed.size.cols);
        let col = i % parsed.size.cols;

        let char = parsed.grid[i];
        if (char.length != 1) {
            console.error("Contains rebus");
            process.exit("1");
        }

        if (char != ".") {
            coords.push((col + 1) + "," + (row + 1));
        }
    }

    return coords;
}