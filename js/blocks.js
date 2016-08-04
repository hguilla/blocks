(function () {
var canvas = document.getElementById('game');

var controller = {};

var ctx = canvas.getContext('2d');
var KEYCODE_UP = 38,
	KEYCODE_RIGHT = 39,
	KEYCODE_DOWN = 40,
	KEYCODE_LEFT = 37,
	KEYCODE_SPACE = 32;

var SIDE_SIZE = 20;
var RATE = 5;
var FPS = 1000 / 60;
var AVAILABLE_PIECES = ['O','L','J','S','Z','T','I'];
var PIECE_COLORS = [ 'blue', 'purple', 'white', 'green', 'cyan', 'brown', 'red' ];

var blocks = [];
var counter = 0;
var score = 0;
var intervalo;

var currentPiece = [];
var pieceForm;
var rotationState;

var game = {
	state: 'playing'
};

function addKeyboardEvents() {

	function addEvent(elemento,nombreEvento,funcion) {
		if (elemento.addEventListener) {
			elemento.addEventListener(nombreEvento,funcion,false);
		} else if (elemento.attachEvent) {
			elemento.attachEvent(nombreEvento,funcion);
		}
	}

	addEvent(document, "keydown", function(e) {
		var movementIsAllowed,
			block,
			i,
			j,
			piece;
		e.preventDefault();
		if (e.keyCode==KEYCODE_LEFT) {
			movementIsAllowed = true;
			for (i in currentPiece) {
				if (! currentPiece.hasOwnProperty(i)) continue;
				piece = currentPiece[i];
				if (piece.x > 0) {
					for (j in blocks) {
						if (! blocks.hasOwnProperty(j)) continue;
						block = blocks[j];
						if (block.x === piece.x - SIDE_SIZE && piece.y === block.y) {
							movementIsAllowed = false;
							break;
						}
					}
				} else {
					movementIsAllowed = false;
				}
				if (! movementIsAllowed) break;
			}
			if (movementIsAllowed) {
				for (i in currentPiece) {
					piece = currentPiece[i];
					piece.x -= SIDE_SIZE;
				}
			}
		} else if (e.keyCode === KEYCODE_RIGHT) {
			movementIsAllowed = true;
			for (i in currentPiece) {
				if (! currentPiece.hasOwnProperty(i)) continue;
				piece = currentPiece[i];
				if (piece.x + SIDE_SIZE < canvas.width) {
					for (j in blocks) {
						if (! blocks.hasOwnProperty(j)) continue;
						block = blocks[j];
						if (block.x == piece.x + SIDE_SIZE && piece.y == block.y) {
							movementIsAllowed = false;
							break;
						}
					}
				} else {
					movementIsAllowed = false;
				}
				if (! movementIsAllowed) break;
			}
			if (movementIsAllowed) {
				for (i in currentPiece) {
					piece = currentPiece[i];
					piece.x += SIDE_SIZE;
				}
			}
		}
		if (e.keyCode === KEYCODE_UP) {
			rotarPieza('left');
		}
		if (e.keyCode === KEYCODE_DOWN) {
			rotarPieza('right');
		}
		if (e.keyCode === KEYCODE_SPACE) {
			while(movementAllowed()) {
				movePiece();
			}
		}
	});
}

function movePiece() {
	var i,
		piece;
	for (i in currentPiece) {
		if (! currentPiece.hasOwnProperty(i)) continue;
		piece = currentPiece[i];
		piece.y += SIDE_SIZE;
	}
}

function movementAllowed() {
	var allowed = true,
		i,
		j,
		piece,
		block;
	for (i in currentPiece) {
		piece = currentPiece[i];
		
		if (piece.y + SIDE_SIZE < canvas.height) {
			for (j in blocks) {
				block = blocks[j];
				if (block.y == piece.y + SIDE_SIZE && block.x == piece.x) {
					allowed = false;
					break;
				}
			}
		} else {
			allowed = false;
		}
		if (! allowed) { 
			currentPieceToBlock();
			break;
		}
	}
	return allowed;
}

function currentPieceToBlock() {
	var i,
		block;
	for (i in currentPiece) {
		if (! currentPiece.hasOwnProperty(i)) continue;
		block = currentPiece[i];
		blocks.push(block);
	}
	generatePieces();
}

function generatePieces() {
	var pieceIndex = Math.floor(Math.random() * 7),
		newPiece = [],
		i,
		newBlock,
		block,
		overlapped;
	pieceForm = AVAILABLE_PIECES[pieceIndex];
	rotationState = 0;

	newPiece.push(generateBlock(canvas.width / 2, 0, PIECE_COLORS[pieceIndex]));
	if (pieceForm == 'O') {
		newPiece.push(generateBlock(canvas.width / 2 + SIDE_SIZE, 0, PIECE_COLORS[pieceIndex]));
		newPiece.push(generateBlock(canvas.width / 2, SIDE_SIZE, PIECE_COLORS[pieceIndex]));
		newPiece.push(generateBlock(canvas.width / 2 + SIDE_SIZE, SIDE_SIZE, PIECE_COLORS[pieceIndex]));
	} else if (pieceForm == 'L') {
		newPiece.push(generateBlock(canvas.width / 2, SIDE_SIZE, PIECE_COLORS[pieceIndex]));
		newPiece.push(generateBlock(canvas.width / 2, SIDE_SIZE * 2, PIECE_COLORS[pieceIndex]));
		newPiece.push(generateBlock(canvas.width / 2 + SIDE_SIZE, SIDE_SIZE * 2, PIECE_COLORS[pieceIndex]));
	} else if (pieceForm == 'J') {
		newPiece.push(generateBlock(canvas.width / 2, SIDE_SIZE, PIECE_COLORS[pieceIndex]));
		newPiece.push(generateBlock(canvas.width / 2, SIDE_SIZE * 2, PIECE_COLORS[pieceIndex]));
		newPiece.push(generateBlock(canvas.width / 2-SIDE_SIZE, SIDE_SIZE * 2, PIECE_COLORS[pieceIndex]));
	} else if (pieceForm == 'S') {
		newPiece.push(generateBlock(canvas.width / 2 + SIDE_SIZE, 0, PIECE_COLORS[pieceIndex]));
		newPiece.push(generateBlock(canvas.width / 2, SIDE_SIZE, PIECE_COLORS[pieceIndex]));
		newPiece.push(generateBlock(canvas.width / 2-SIDE_SIZE, SIDE_SIZE, PIECE_COLORS[pieceIndex]));
	} else if (pieceForm == 'Z') {
		newPiece.push(generateBlock(canvas.width / 2-SIDE_SIZE, 0, PIECE_COLORS[pieceIndex]));
		newPiece.push(generateBlock(canvas.width / 2, SIDE_SIZE, PIECE_COLORS[pieceIndex]));
		newPiece.push(generateBlock(canvas.width / 2 + SIDE_SIZE, SIDE_SIZE, PIECE_COLORS[pieceIndex]));
	} else if (pieceForm == 'T') {
		newPiece.push(generateBlock(canvas.width / 2-SIDE_SIZE, 0, PIECE_COLORS[pieceIndex]));
		newPiece.push(generateBlock(canvas.width / 2 + SIDE_SIZE, 0, PIECE_COLORS[pieceIndex]));
		newPiece.push(generateBlock(canvas.width / 2, SIDE_SIZE, PIECE_COLORS[pieceIndex]));
	} else {
		newPiece.push(generateBlock(canvas.width / 2-SIDE_SIZE, 0, PIECE_COLORS[pieceIndex]));
		newPiece.push(generateBlock(canvas.width / 2 + SIDE_SIZE, 0, PIECE_COLORS[pieceIndex]));
		newPiece.push(generateBlock(canvas.width / 2 + SIDE_SIZE * 2, 0, PIECE_COLORS[pieceIndex]));
	}
	for (i in newPiece) {
		newBlock = newPiece[i];
		for (j in blocks) {
			block = blocks[j];
			overlapped = overlaps(block, newBlock);
			if (overlapped) {
				game.state = 'over';
			}
		}
	}
	if (game.state=='playing') currentPiece = newPiece;
}

function rotarPieza(orientation) {
	var newPiece,
		centralBlock,
		overlaps,
		i,
		j,
		newBlock,
		block;
	if (pieceForm !== 'O') {
		newPiece = [];
		centralBlock = currentPiece[0];
		newPiece.push(centralBlock);
		
		if (orientation === 'left') {
			rotationState--;
		} else {
			rotationState++;
		}
		rotationState = (rotationState + 4) % 4;
		if (rotationState === 0) {
			if (pieceForm === 'L') {
				newPiece.push(generateBlock(centralBlock.x, centralBlock.y + SIDE_SIZE, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x, centralBlock.y + SIDE_SIZE * 2, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x + SIDE_SIZE, centralBlock.y + SIDE_SIZE * 2, centralBlock.color));
			} else if (pieceForm === 'J') {
				newPiece.push(generateBlock(centralBlock.x, centralBlock.y + SIDE_SIZE, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x, centralBlock.y + SIDE_SIZE * 2, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x-SIDE_SIZE, centralBlock.y + SIDE_SIZE * 2, centralBlock.color));
			} else if (pieceForm === 'S') {
				newPiece.push(generateBlock(centralBlock.x + SIDE_SIZE, centralBlock.y, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x, centralBlock.y + SIDE_SIZE, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x-SIDE_SIZE, centralBlock.y + SIDE_SIZE, centralBlock.color));
			} else if (pieceForm === 'Z') {
				newPiece.push(generateBlock(centralBlock.x-SIDE_SIZE, centralBlock.y, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x, centralBlock.y + SIDE_SIZE, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x + SIDE_SIZE, centralBlock.y + SIDE_SIZE, centralBlock.color));
			} else if (pieceForm === 'T') {
				newPiece.push(generateBlock(centralBlock.x-SIDE_SIZE, centralBlock.y, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x + SIDE_SIZE, centralBlock.y, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x, centralBlock.y + SIDE_SIZE, centralBlock.color));
			} else {
				newPiece.push(generateBlock(centralBlock.x-SIDE_SIZE, centralBlock.y, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x + SIDE_SIZE, centralBlock.y, centralBlock.color, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x + SIDE_SIZE * 2, centralBlock.y, centralBlock.color));
			}
		} else if (rotationState === 1) {
			if (pieceForm === 'T') {
				newPiece.push(generateBlock(centralBlock.x, centralBlock.y - SIDE_SIZE, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x, centralBlock.y + SIDE_SIZE, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x-SIDE_SIZE, centralBlock.y, centralBlock.color));
			} else if (pieceForm === 'I') {
				newPiece.push(generateBlock(centralBlock.x, centralBlock.y - SIDE_SIZE, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x, centralBlock.y + SIDE_SIZE, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x, centralBlock.y + SIDE_SIZE * 2, centralBlock.color));
			} else if (pieceForm === 'J') {
				newPiece.push(generateBlock(centralBlock.x-SIDE_SIZE, centralBlock.y, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x + SIDE_SIZE, centralBlock.y, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x-SIDE_SIZE, centralBlock.y - SIDE_SIZE, centralBlock.color));
			} else if (pieceForm === 'L') {
				newPiece.push(generateBlock(centralBlock.x-SIDE_SIZE, centralBlock.y, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x-SIDE_SIZE, centralBlock.y + SIDE_SIZE, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x + SIDE_SIZE, centralBlock.y, centralBlock.color));
			} else if (pieceForm === 'S') {
				newPiece.push(generateBlock(centralBlock.x-SIDE_SIZE, centralBlock.y, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x-SIDE_SIZE, centralBlock.y - SIDE_SIZE, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x, centralBlock.y + SIDE_SIZE, centralBlock.color));
			} else {
				newPiece.push(generateBlock(centralBlock.x, centralBlock.y - SIDE_SIZE, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x-SIDE_SIZE, centralBlock.y, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x-SIDE_SIZE, centralBlock.y + SIDE_SIZE, centralBlock.color));
			}
		} else if (rotationState === 2) {
			if (pieceForm === 'T') {
				newPiece.push(generateBlock(centralBlock.x-SIDE_SIZE, centralBlock.y, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x + SIDE_SIZE, centralBlock.y, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x, centralBlock.y - SIDE_SIZE, centralBlock.color));
			} else if (pieceForm === 'I') {
				newPiece.push(generateBlock(centralBlock.x-SIDE_SIZE, centralBlock.y, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x-SIDE_SIZE * 2, centralBlock.y, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x + SIDE_SIZE, centralBlock.y, centralBlock.color));
			} else if (pieceForm === 'J') {
				newPiece.push(generateBlock(centralBlock.x, centralBlock.y - SIDE_SIZE, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x + SIDE_SIZE, centralBlock.y - SIDE_SIZE, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x, centralBlock.y + SIDE_SIZE, centralBlock.color));
			} else if (pieceForm === 'L') {
				newPiece.push(generateBlock(centralBlock.x, centralBlock.y - SIDE_SIZE, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x-SIDE_SIZE, centralBlock.y - SIDE_SIZE, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x, centralBlock.y + SIDE_SIZE, centralBlock.color));
			} else if (pieceForm === 'S') {
				newPiece.push(generateBlock(centralBlock.x-SIDE_SIZE, centralBlock.y, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x, centralBlock.y - SIDE_SIZE, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x + SIDE_SIZE, centralBlock.y - SIDE_SIZE, centralBlock.color));
			} else {
				newPiece.push(generateBlock(centralBlock.x, centralBlock.y - SIDE_SIZE, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x-SIDE_SIZE, centralBlock.y - SIDE_SIZE, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x + SIDE_SIZE, centralBlock.y, centralBlock.color));
			}
		} else {
			if (pieceForm === 'T') {
				newPiece.push(generateBlock(centralBlock.x, centralBlock.y - SIDE_SIZE, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x, centralBlock.y + SIDE_SIZE, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x + SIDE_SIZE, centralBlock.y, centralBlock.color));
			} else if (pieceForm === 'I') {
				newPiece.push(generateBlock(centralBlock.x, centralBlock.y - SIDE_SIZE, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x, centralBlock.y - SIDE_SIZE * 2, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x, centralBlock.y + SIDE_SIZE, centralBlock.color));
			} else if (pieceForm === 'J') {
				newPiece.push(generateBlock(centralBlock.x-SIDE_SIZE, centralBlock.y, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x + SIDE_SIZE, centralBlock.y, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x + SIDE_SIZE, centralBlock.y + SIDE_SIZE, centralBlock.color));
			} else if (pieceForm === 'L') {
				newPiece.push(generateBlock(centralBlock.x-SIDE_SIZE, centralBlock.y, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x + SIDE_SIZE, centralBlock.y, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x + SIDE_SIZE, centralBlock.y - SIDE_SIZE, centralBlock.color));
			} else if (pieceForm === 'S') {
				newPiece.push(generateBlock(centralBlock.x, centralBlock.y - SIDE_SIZE, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x + SIDE_SIZE, centralBlock.y, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x + SIDE_SIZE, centralBlock.y + SIDE_SIZE, centralBlock.color));
			} else {
				newPiece.push(generateBlock(centralBlock.x + SIDE_SIZE, centralBlock.y, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x + SIDE_SIZE, centralBlock.y - SIDE_SIZE, centralBlock.color));
				newPiece.push(generateBlock(centralBlock.x, centralBlock.y + SIDE_SIZE, centralBlock.color));
			}
		}
		overlaps = false;
		for (i in newPiece) {
			if (! newPiece.hasOwnProperty(i)) continue;
			newBlock = newPiece[i];
			if (newBlock.x < 0 || newBlock.x >= canvas.width || newBlock.y >= canvas.height) {
				overlaps = true;
				break;
			}
			for (j in blocks) {
				if (! blocks.hasOwnProperty(j)) continue;
				block = blocks[j];
				if (overlaps(newBlock, block)) {
					overlaps = true;
					break;
				}
			}
			if (overlaps) {
				break;
			}
		}
		if (! overlaps) {
			currentPiece = newPiece;
		} else {
			if (orientation === 'left') {
				rotationState++;
			} else {
				rotationState--;
			}
			rotationState = rotationState % 4;
		}
		
	}
	
}

function overlaps(a,b) {
	return (a.x === b.x && a.y === b.y);
}

function generateBlock(posX, posY, color) {
	var block = {
		x:     posX,
		y:     posY,
		color: color
	}
	return block;
}

function dibujarBloques() {
	var i,
		block;
	for (i in blocks) {
		block = blocks[i];
		ctx.save();
		ctx.fillStyle = block.color;
		ctx.fillRect(block.x, block.y, SIDE_SIZE, SIDE_SIZE);
		ctx.restore();
		ctx.fillStyle = 'black';
		ctx.strokeRect(block.x, block.y, SIDE_SIZE, SIDE_SIZE);
		ctx.restore();
	};
	for (i in currentPiece) {
		block = currentPiece[i];
		ctx.save();
		ctx.fillStyle = block.color;
		ctx.fillRect(block.x, block.y, SIDE_SIZE, SIDE_SIZE);
		ctx.restore();
		ctx.fillStyle = 'black';
		ctx.strokeRect(block.x, block.y, SIDE_SIZE, SIDE_SIZE);
		ctx.restore();
	}
}

function dibujarFondo() {
	ctx.save();
	ctx.fillStyle = 'lightseagreen';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.restore();
}

function dibujarTexto() {
	ctx.save();
	ctx.fillStyle = 'black';
	ctx.font = '30px bold';
	ctx.fillText(score, 15, 30);
	ctx.restore();
}

function drawGameOverText() {
	ctx.save();
	ctx.fillStyle = 'red';
	ctx.font = 'Bold 12pt Arial';
	ctx.fillText('JUEGO TERMINADO', 10, canvas.height / 2);
	ctx.restore();
	ctx.fillStyle = 'red';
	ctx.font = 'Bold 12pt Arial';
	ctx.fillText('SCORE: ' + score, canvas.width / 4, canvas.height * 3 / 4);
	ctx.restore();
}

function controlLines() {
	var i,
		line;
	for (i = (canvas.height - SIDE_SIZE) / SIDE_SIZE; i > 0; i--) {
		line = blocks.filter(function(block) {
			if (block.y === i * SIDE_SIZE) return true;
		});
		if (line.length === canvas.width / SIDE_SIZE) {
			blocks = blocks.filter(function(block) {
				return !inArray(line, block);
			});
			score += 1;
			RATE *= 1.05;
			bajarLineas(i * SIDE_SIZE);
			i--;
		}
	};
}

function bajarLineas(desde) {
	var i;
	for (i in blocks) {
		if (! blocks.hasOwnProperty(i)) continue;
		block = blocks[i];
		if (block.y < desde) {
			block.y += SIDE_SIZE;
		}
	}
}

function inArray(unArray, elemento) {
	var isIn = false,
		i;
	for (i = unArray.length - 1; i >= 0; i--) {
		elementoDelArray = unArray[i];
		if (elemento === elementoDelArray) {
			isIn = true;
			break;
		}
	};
	return isIn;
}

function frameLoop() {
	dibujarFondo();
	dibujarBloques();
	dibujarTexto();
	counter += RATE;
	if (counter >= 100) {
		if (game.state === 'playing') {
			if (movementAllowed())movePiece();
			counter = 0;
		}
	}
	controlLines();
	if (game.state === 'over') {
		drawGameOverText();
	}
}

window.addEventListener('load', init);

function init() {
	generatePieces();
	addKeyboardEvents();
	intervalo = window.setInterval(frameLoop, FPS);
}

})();
