function start() {
	canvasHolder.initCanvas();
	formNewMaze();
	drawMaze();
}

// Used for adjusting the canvas size according to its holder size.
CANVAS_WIDTH_COEF = 0.99;
CANVAS_HEIGHT_COEF = 0.88;

var canvasHolder = {
    canvas : document.createElement("canvas"),
    initCanvas : function() {
        this.canvas.width = screen.width * CANVAS_WIDTH_COEF;
        this.canvas.height = screen.height * CANVAS_HEIGHT_COEF;
        this.canvas.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    },
	clear : function() {
		this.canvas.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
};

/////////////////////////////////////////////////////////////////////////////////////////////
//-///-///-///-///-///-///-///-///-///-///-///-///-///-///-///-///-///-///-///-///-///-///-//
////////////////////////////////////////// Drawing //////////////////////////////////////////
//-///-///-///-///-///-///-///-///-///-///-///-///-///-///-///-///-///-///-///-///-///-///-//
/////////////////////////////////////////////////////////////////////////////////////////////

REDMAX = 200;
GREENMAX = 230;
BLUEMAX = 250;

function drawMaze() {
	var ctx = canvasHolder.canvas.context;
	ctx.lineWidth = 1;
	red = 0;
	green = 0;
	blue = 0;
	var prevRed, prevGreen, prevBlue;
	strokeStyle = rgb(red,green,blue);

	redCoef = Math.random()*255;
	greenCoef = Math.random()*255;
	blueCoef = Math.random()*255;

	for (var w_index = 0; w_index < maze.width; w_index++) {
		for (var h_index = 0; h_index < maze.height; h_index++) {
			red = (Math.random()*redCoef + Math.random()*red)%REDMAX;
			green = (Math.random()*greenCoef + Math.random()*green)%GREENMAX;
			blue = (Math.random()*blueCoef + Math.random()*blue)%BLUEMAX;

			strokeStyle = rgb(red, green, blue);
			ctx.strokeStyle = strokeStyle;
			if (maze.cells[w_index][h_index].top) {
				ctx.beginPath();
				ctx.moveTo(maze.cellWidth*w_index,maze.cellHeight*h_index);
				ctx.lineTo(maze.cellWidth*(w_index+1),maze.cellHeight*h_index);
				ctx.stroke();
			}

			if (maze.cells[w_index][h_index].right) {
				ctx.beginPath();
				ctx.moveTo(maze.cellWidth*(w_index+1),maze.cellHeight*h_index);
				ctx.lineTo(maze.cellWidth*(w_index+1),maze.cellHeight*(h_index+1));
				ctx.stroke();
			}

			if (maze.cells[w_index][h_index].bottom) {
				ctx.beginPath();
				ctx.moveTo(maze.cellWidth*w_index,maze.cellHeight*(h_index+1));
				ctx.lineTo(maze.cellWidth*(w_index+1),maze.cellHeight*(h_index+1));
				ctx.stroke();
			}

			if (maze.cells[w_index][h_index].left) {
				ctx.beginPath();
				ctx.moveTo(maze.cellWidth*w_index,maze.cellHeight*h_index);
				ctx.lineTo(maze.cellWidth*w_index,maze.cellHeight*(h_index+1));
				ctx.stroke();
			}
		}
	}
}

function rgb(red, green, blue) {
	return 'rgb(' + red + ',' + green + ',' + blue + ')';
}

/////////////////////////////////////////////////////////////////////////////////////////////
//-///-///-///-///-///-///-///-///-///-///-///-///-///-///-///-///-///-///-///-///-///-///-//
/////////////////////////////////////// Maze Building ///////////////////////////////////////
//-///-///-///-///-///-///-///-///-///-///-///-///-///-///-///-///-///-///-///-///-///-///-//
/////////////////////////////////////////////////////////////////////////////////////////////

WALL_PROBABILITY = 0.7;

var maze = {
	width: 0,
	height: 0,
	cells: [],
	walls: [],
	cellHeight: 0,
	cellWidth: 0,
	wallWidth: 0,
	getCellByCoordinates : function(x, y) {
		var x_index = (x-x%(this.cellWidth))/(this.cellWidth);
		var y_index = (y-y%(this.cellHeight))/(this.cellHeight);
		return this.cells[x_index][y_index];
	},
	getCollidableWallsByCoordinates : function(x, y) {
		cell = this.getCellByCoordinates(x, y);
		var cellAbove = cell.row > 0 ? maze.cells[cell.column][cell.row-1] : false;
		var cellBelow = cell.row < maze.height-1 ? maze.cells[cell.column][cell.row+1] : false;
		var cellToTheLeft = cell.column > 0 ? maze.cells[cell.column-1][cell.row] : false;
		var cellToTheRight = cell.column < maze.width-1 ? maze.cells[cell.column+1][cell.row] : false;
		
		var tempResult = [cell.top, cell.bottom, cell.left, cell.right,
				cellAbove.bottom, cellAbove.left, cellAbove.right,
				cellBelow.top, cellBelow.left, cellBelow.right,
				cellToTheLeft.top, cellToTheLeft.bottom, cellToTheLeft.right,
				cellToTheRight.top, cellToTheRight.bottom, cellToTheRight.left];

		var finalResult = [];
		var resultIndex = 0;
		for (var i = 0; i < tempResult.length; i++) {
			if (tempResult[i]) {
				finalResult[resultIndex] = tempResult[i];
				resultIndex++;
			}
		}
	}
}

function generateCell(w_index, h_index) {
	var cell = {
		top: false,
		bottom: false,
		right: false,
		left: false,
		row: h_index,
		column: w_index
	}
	if (h_index == 0) {
		cell.top = generateWall(w_index*maze.cellWidth, h_index*maze.cellHeight - maze.wallWidth/2, (w_index+1)*maze.cellWidth, h_index*maze.cellHeight + maze.wallWidth/2);
	}
	if (h_index == maze.height-1 || parseInt(Math.random() + WALL_PROBABILITY) == 1) {
		cell.bottom = generateWall(w_index*maze.cellWidth, (h_index+1)*maze.cellHeight - maze.wallWidth/2, (w_index+1)*maze.cellWidth, (h_index+1)*maze.cellHeight + maze.wallWidth/2);
	}
	if (w_index == maze.width-1 || parseInt(Math.random() + WALL_PROBABILITY) == 1) {
		cell.right = generateWall((w_index+1)*maze.cellWidth - maze.wallWidth/2, h_index*maze.cellHeight, (w_index+1)*maze.cellWidth + maze.wallWidth/2, (h_index+1)*maze.cellHeight);
	}
	if (w_index == 0) {
		cell.left = generateWall(w_index*maze.cellWidth - maze.wallWidth/2, h_index*maze.cellHeight, w_index*maze.cellWidth + maze.wallWidth/2, (h_index+1)*maze.cellHeight);
	}
	return cell;
}

function generateWall(startX, startY, endX, endY) {
	var wall = {
		startX: startX,
		startY: startY,
		endX: endX,
		endY: endY
	}
	return wall;
}

const TOP_WALL = "TOP WALL"
const RIGHT_WALL = "RIGHT WALL"
const BOTTOM_WALL = "BOTTOM WALL"
const LEFT_WALL = "LEFT WALL"

const XINDEX = 0;
const YINDEX = 1;

//	Removing walls which cause cells to be unreachable.
function clearPaths() {
	visited = [];

	for (var w_index = 0; w_index < maze.width; w_index++) {
		visited[w_index] = [];
		for (var h_index = 0; h_index < maze.height; h_index++) {
			visited[w_index][h_index] = false;
		}
	}
	
	w_index_wl = 0;
	h_index_wl = 0;
	cell = maze.cells[w_index_wl][h_index_wl];

	cellsStack = [];
	cellsStackIndex = 0;

	while (true) {	// Oh shit.
		w_index_wl = cell.column;
		h_index_wl = cell.row;
		
		visited[w_index_wl][h_index_wl] = true;

		unvisitedNeighbours = [];
		unvisited_index = 0;
		removableWalls = [];

		if (0<h_index_wl && !(visited[w_index_wl][h_index_wl-1])) {
			// Top
			unvisitedNeighbours[unvisited_index] = maze.cells[w_index_wl][h_index_wl-1];
			removableWalls[unvisited_index] = TOP_WALL;
			unvisited_index++;
		}
		if (w_index_wl<maze.width-1 && !(visited[w_index_wl+1][h_index_wl])) {
			// Right
			unvisitedNeighbours[unvisited_index] = maze.cells[w_index_wl+1][h_index_wl];
			removableWalls[unvisited_index] = RIGHT_WALL;
			unvisited_index++;
		}
		if (h_index_wl<maze.height-1 && !(visited[w_index_wl][h_index_wl+1])) {
			// Bottom
			unvisitedNeighbours[unvisited_index] = maze.cells[w_index_wl][h_index_wl+1];
			removableWalls[unvisited_index] = BOTTOM_WALL;
			unvisited_index++;
		}
		if (0<w_index_wl && !(visited[w_index_wl-1][h_index_wl])) {
			// Left
			unvisitedNeighbours[unvisited_index] = maze.cells[w_index_wl-1][h_index_wl];
			removableWalls[unvisited_index] = LEFT_WALL;
			unvisited_index++;
		}

		if (unvisitedNeighbours.length > 0) {	// If there are any unvisited neighbours we choose one.
			// First we check if there's an open path to one unvisited neighbour.
			openToVisit = []
			openToVisitIndex = 0;
			for (var i = 0; i < unvisitedNeighbours.length; i++) {
				switch (removableWalls[i]) {
					case TOP_WALL:
						if(!maze.cells[w_index_wl][h_index_wl-1].bottom) {
							openToVisit[openToVisitIndex] = maze.cells[w_index_wl][h_index_wl-1]
							openToVisitIndex++;
						}
						break;
					case RIGHT_WALL:
						if(!maze.cells[w_index_wl][h_index_wl].right) {
							openToVisit[openToVisitIndex] = maze.cells[w_index_wl+1][h_index_wl]
							openToVisitIndex++;
						}
						break;
					case BOTTOM_WALL:
						if(!maze.cells[w_index_wl][h_index_wl].bottom) {
							openToVisit[openToVisitIndex] = maze.cells[w_index_wl][h_index_wl+1]
							openToVisitIndex++;
						}
						break;
					case LEFT_WALL:
						if(!maze.cells[w_index_wl-1][h_index_wl].right) {
							openToVisit[openToVisitIndex] = maze.cells[w_index_wl-1][h_index_wl]
							openToVisitIndex++;
						}
						break;
					default:
				}
			}

			if (openToVisit.length > 0) {
				wall_index = Math.random()*openToVisit.length;
				wall_index -= wall_index%1;

				cellsStack[cellsStackIndex] = cell;
				cellsStackIndex++;
				cell = openToVisit[wall_index]
			} else {
				wall_index = Math.random()*removableWalls.length;
				wall_index -= wall_index%1;
				switch (removableWalls[wall_index]) {
					case TOP_WALL:
						h_index_wl--;
						maze.cells[w_index_wl][h_index_wl].bottom = false;
						break;
					case RIGHT_WALL:
						cell.right = false;
						w_index_wl++;
						break;
					case BOTTOM_WALL:
						cell.bottom = false;
						h_index_wl++;
						break;
					case LEFT_WALL:
						w_index_wl--;
						maze.cells[w_index_wl][h_index_wl].right = false;
						break;
					default:
						console.error("switch (removableWalls[wall_index]) -> Default?");
				}

				cellsStack[cellsStackIndex] = cell;
				cellsStackIndex++;
				cell = unvisitedNeighbours[wall_index]
			}
		} else {	// If there aren't, we need to go back the stack.
			if (cell == maze.cells[0][0]) {
				// We are done here.
				break;
			} else {
				cellsStack[cellsStackIndex] = undefined;
				cellsStackIndex--;
				cell = cellsStack[cellsStackIndex];
			}
		}
	}
}

// Since we don't assign left and top walls on the generation of a cell
// we need to assign them if their corresponding neighbors do have right or bottom walls.
function syncWalls() {
	for (var w_index = 0; w_index < maze.width; w_index++) {
		for (var h_index = 0; h_index < maze.height; h_index++) {
			if (w_index > 0 && maze.cells[w_index-1][h_index].right) {
				maze.cells[w_index][h_index].left = generateWall(w_index*maze.cellWidth - maze.wallWidth/2, h_index*maze.cellHeight, w_index*maze.cellWidth + maze.wallWidth/2, (h_index+1)*maze.cellHeight);
			}
			if (h_index > 0 && maze.cells[w_index][h_index-1].bottom) {
				maze.cells[w_index][h_index].top = generateWall(w_index*maze.cellWidth, h_index*maze.cellHeight - maze.wallWidth/2, (w_index+1)*maze.cellWidth, h_index*maze.cellHeight + maze.wallWidth/2);
			}
		}
	}
}

CELL_SIZE = 6;

function formNewMaze() {
	maze.width = parseInt(canvasHolder.canvas.width/CELL_SIZE);
	maze.height = parseInt(canvasHolder.canvas.height/CELL_SIZE);

	maze.cellWidth = canvasHolder.canvas.width/maze.width;
	maze.cellHeight = canvasHolder.canvas.height/maze.height;

	maze.wallWidth = 1;

	maze.cells = [];

	for (var w_index = 0; w_index < maze.width; w_index++) {
		maze.cells[w_index] = [];
		for (var h_index = 0; h_index < maze.height; h_index++) {
			maze.cells[w_index][h_index] = generateCell(w_index,h_index);
		}
	}

	clearPaths();
	syncWalls();

	var cellWidth = canvasHolder.canvas.width/maze.width;
	var cellHeight = canvasHolder.canvas.height/maze.height;

	var wallWidth = 1;
}