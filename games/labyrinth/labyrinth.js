const C_UP      = 1 << 0;
const C_LEFT    = 1 << 1;
const C_RIGHT   = 1 << 2;
const C_DOWN    = 1 << 3;
const C_VISITED = 1 << 4;

const GRID_SIZE = 20;

function init() {
    
    grid = [];
    for (var i = 0; i < GRID_SIZE; i++) {
        grid.push([]);
        for (var j = 0; j < GRID_SIZE; j++) {
            grid[i].push(0);
        }
    }
    
    genLevel(grid, []);
    
    var gameCtx = {pLoc: {x: 0, y: 0}, oldPLoc: {x: 0, y: 0}, grid: grid};
    
    draw(gameCtx);
    drawPlayer(gameCtx);
    
    // register call back functions
    document.addEventListener("keydown", function(event){ keydown(event, gameCtx);});
}

// ----------------------------------------------------------------
//                      Game logic
// ----------------------------------------------------------------

function keydown(event, gameCtx) {
    
    // move player
    switch (event.keyCode) {
        // arrow top or w
        case 87:
        case 38:
            if (gameCtx.grid[gameCtx.pLoc.x][gameCtx.pLoc.y] & C_UP) {
                gameCtx.pLoc.y--;
                drawPlayer(gameCtx);
            }
            break;
        // arrow down or s
        case 83:
        case 40:
            if (gameCtx.grid[gameCtx.pLoc.x][gameCtx.pLoc.y] & C_DOWN) {
                gameCtx.pLoc.y++;
                drawPlayer(gameCtx);
            }
            break;
        // arrow left or a
        case 65:
        case 37:
            if (gameCtx.grid[gameCtx.pLoc.x][gameCtx.pLoc.y] & C_LEFT) {
                gameCtx.pLoc.x--;
                drawPlayer(gameCtx);
            }
            break;
        // arrow right or d
        case 68:
        case 39:
            if (gameCtx.grid[gameCtx.pLoc.x][gameCtx.pLoc.y] & C_RIGHT) {
                gameCtx.pLoc.x++; 
                drawPlayer(gameCtx);
            }
            break;
        default:
            break;
    }
}


// ----------------------------------------------------------------
//                      Level generation
// ----------------------------------------------------------------

function genLevel(grid, trapdoors) {
    var loc = {x:0, y:0};
    
    bt(loc);
    
    function bt(loc) {
        // mark current cell as visited
        grid[loc.x][loc.y] = grid[loc.x][loc.y] | C_VISITED;
        
        while (true) {
            // find unvisted cells arround us
            var cells = unvisitedCells(loc);
            
            // repeat until no more unvisted cells
            if (cells.length == 0) break;
            
            // choose randome cell
            shuffle(cells);
            var cell = cells[0];
            
            // set connection between us
            if (cell.x == loc.x) {
                // above or below
                if (cell.y + 1 == loc.y) {
                    // above
                    grid[loc.x][loc.y] = grid[loc.x][loc.y] | C_UP;
                    grid[cell.x][cell.y] = grid[cell.x][cell.y] | C_DOWN;
                } else {
                    // below
                    grid[loc.x][loc.y] = grid[loc.x][loc.y] | C_DOWN;
                    grid[cell.x][cell.y] = grid[cell.x][cell.y] | C_UP;
                }                
            } else {
                // left or right
                if (cell.x + 1 == loc.x) {
                    // left
                    grid[loc.x][loc.y] = grid[loc.x][loc.y] | C_LEFT;
                    grid[cell.x][cell.y] = grid[cell.x][cell.y] | C_RIGHT;
                } else {
                    // left
                    grid[loc.x][loc.y] = grid[loc.x][loc.y] | C_RIGHT;
                    grid[cell.x][cell.y] = grid[cell.x][cell.y] | C_LEFT;
                } 
            }
            
            // go to that new cell
            bt(cell);
        }
    }
    
    function unvisitedCells(loc) {
        var unCells = [];
        
        if (loc.y != GRID_SIZE-1) {
            // below
            if (!(grid[loc.x][loc.y + 1] & C_VISITED)) unCells.push({x: loc.x, y: loc.y + 1});
        }
        if (loc.x != 0) {
             // left
            if (!(grid[loc.x - 1][loc.y] & C_VISITED)) unCells.push({x: loc.x - 1, y: loc.y});
        }
        
        if (loc.x != GRID_SIZE-1) {
            // right
            if (!(grid[loc.x + 1][loc.y] & C_VISITED)) unCells.push({x: loc.x + 1, y: loc.y});
        }
        
        if (loc.y != 0) {
            // above
            if (!(grid[loc.x][loc.y - 1] & C_VISITED)) unCells.push({x: loc.x, y: loc.y - 1});
        }
        
        //console.log(unCells.toString())
        return unCells;
    }
}

/**
 * Shuffles array in place.
 * @param {Array} a items The array containing the items.
 * @return {Array} a The shuffled array
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i -= 1) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

// ----------------------------------------------------------------
//                      Drawing functions
// ----------------------------------------------------------------

function draw(gameCtx) {
    var grid = gameCtx.grid;
    var c = document.getElementById("playArea");
    var ctx = c.getContext("2d");
    
    
    // square playing area
    var dim = c.getAttribute("width");
    
    // clear the canvas for new drawing
    ctx.clearRect(0,0,dim,dim);
    
    
    // work out the width of each cell
    var cellW = dim/GRID_SIZE;
    gameCtx.cellW = cellW;
    var cellB = 6; // cell boarder width

    // draw the finish
    ctx.fillStyle = "#00fff5";
    ctx.fillRect(dim - cellW, dim - cellW, cellW, cellW);
    
    ctx.lineWidth = cellB;
    ctx.strokeStyle = "#00";
    // loop through each index and draw the top and left boarder
    for (var i = 0; i < GRID_SIZE; i++) {
        for (var j = 0; j < GRID_SIZE; j++) {
            var val = grid[i][j];
            // check for top boarder
            if (!(val & C_UP)) {
                ctx.moveTo(cellW * i - cellB/2, cellW * j);
                ctx.lineTo(cellW * (i + 1) + cellB/2, cellW * j);
            }
            // check for left boarder
            if (!(val & C_LEFT)) {
                ctx.moveTo(cellW * i, cellW * j);
                ctx.lineTo(cellW * i, cellW * (j + 1));
            }
        }
    }
    
    // draw the outside boarder
    ctx.moveTo(dim, 0);
    ctx.lineTo(dim, dim);
    ctx.lineTo(0, dim);
    
    // draw the labyrinth
    ctx.stroke();
}

function drawPlayer(gameCtx) {
    var grid = gameCtx.grid;
    var c = document.getElementById("playArea");
    var ctx = c.getContext("2d");
    
    var cellW = gameCtx.cellW;
    var oLoc = gameCtx.oldPLoc;
    
    // draw the player
    var pSize = 10;
    var pLoc = gameCtx.pLoc;
    
    // clear old player pos
    ctx.clearRect(cellW * (oLoc.x + 0.5) - pSize/2, cellW * (oLoc.y + 0.5) - pSize/2, pSize, pSize);
    
    ctx.fillStyle = "#cc2121";
    ctx.fillRect(cellW * (pLoc.x + 0.5) - pSize/2, cellW * (pLoc.y + 0.5) - pSize/2, pSize, pSize);
    
    gameCtx.oldPLoc.x = pLoc.x;
    gameCtx.oldPLoc.y = pLoc.y;
}