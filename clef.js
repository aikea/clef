


let setSize = (canvas, width = 400, height = 400) => {
	canvas.width = width;
	canvas.height = height;
}

// the note objects
let notes = [
	{
		"id": 0,
		"name": "G",
		// can add more data 
		// versatile software
	},
	{
		"id": 1,
		"name": "F",
	},
	{
		"id": 2,
		"name": "E",
	},
	{
		"id": 3,
		"name": "D",
	},
	{
		"id": 4,
		"name": "C",
	},
	{
		"id": 5,
		"name": "B",
	},
	{
		"id": 6,
		"name": "A",
	},
	{
		"id": 7,
		"name": "G"
	}
]


let drawStaff = (context, staff) => {
	// set defaults 
	if (!staff.type) { staff.type = "Treble"; }
	if (!staff.lineNum) { staff.lineNum = 5; }

	let w = context.canvas.width;
	let h = context.canvas.height;

	context.fillStyle = 'black';
	let gap = h / 15;
	for (let i = 0; i < staff.lineNum; i++) {
		context.fillRect(0, (h / 3) + (i * gap), w, 1);
	}
}

let clearCanvas = (context) => {
	context.fillStyle = 'white';
	context.fillRect(0, 0, context.canvas.width, context.canvas.height);
}

let drawNote = (context, note) => {
	/*
	@param context - the canvas context to draw on
	@param note - the note object to draw
	*/
	let noteHeadWidth = context.canvas.width / 20;
	let noteHeadHeight = context.canvas.height / 15;
	// note: this shape is drawn assuming translation makes the upper left corner origin
	// this means it is NOT center based
	context.beginPath();
	context.translate(note.x, note.y);	// do the translation
	context.moveTo(0.5 * noteHeadWidth, 0);
	context.quadraticCurveTo(noteHeadWidth, 0, noteHeadWidth, 0.5 * noteHeadHeight);
	context.quadraticCurveTo(noteHeadWidth, noteHeadHeight, 0.5 * noteHeadWidth, noteHeadHeight);
	context.quadraticCurveTo(0, noteHeadHeight, 0, 0.5 * noteHeadHeight);
	context.quadraticCurveTo(0, 0, 0.5 * noteHeadWidth, 0);
	context.fill();

	// draw upward stems for notes G, F, E, D, C
	if (note.id <= 4) {
		context.fillRect(noteHeadWidth, noteHeadHeight * 0.5, 1, -context.canvas.height / 5);
		// and downward stem for the lower notes
	} else {
		context.fillRect(noteHeadWidth, noteHeadHeight * 0.5, 1, context.canvas.height / 5);
	}
	context.translate(-note.x, -note.y);  // undo the translation
	context.closePath();
}

let drawGuitar = (context, note) => {
	// draw guitar strings 
	// setup click event handling
	context.fillStyle = 'rgb(255,0,0,0.5)';
	context.fillRect(0, 0, context.canvas.width, context.canvas.height);
}

// Note: the 'gap' constant 15 is ASSUMED by taking 5 lines of staff 
// As the entire staff height extends from h/3 to 2h/3 i.e. total height of h/3
// the gap between two consecutive staff lines is (1/5) * h/3 = h/15
let generateNoteCoordinates = (context, notes) => {
	notes.map(note => {
		note.x = context.canvas.width / 2;

		// k is a imagined baseline which makes the equation here somewhat prettier
		// it is the y of the first staff line - the gap of the staff lines
		// so, assuming drawing happens taking upper left corner of notehead as origin
		// the coordinates (w/2, k) coincides with the G notehead
		// further, notes are drawn by increasing the y coordinates in steps of 0.5*gap
		// the note id IS IMPORTANT and must be in the order as the notes G,F,E,D...
		// 
		let k = context.canvas.height / 3 - context.canvas.height / 15;
		note.y = k + (note.id * 0.5 * context.canvas.height / 15);
	});
}

function main() {
	let c = document.getElementById("canvas1").getContext('2d');
	setSize(c.canvas, 400, 200);
	// let c2 = document.getElementById("canvas2").getContext('2d');
	// setSize(c2.canvas, 400, 200);
	
	// hyperparameters of the application
	let w = c.canvas.width;
	let h = c.canvas.height;
	// set up event handling
	// drawGuitar(c2);
	
	generateNoteCoordinates(c, notes);
	
	let staff = {
		type: "Treble",
		lineNum: 5,
		lines: [],
	}
	run(c, staff);

	document.addEventListener('keypress', (event) => {
		updateScore(event.code);
	})
}

let DELAY = 2000; 			// how long to wait
let globalRandomNote = null;
let parseInput = true;
let score = 0;
let iteration = 0;	// number of iterations

let updateScore = (keyCode) => {
	if (parseInput) {
		if ("Key" + globalRandomNote.name === keyCode) {
			score++;
			document.getElementById("info").style.color = "green";
			document.getElementById("info").innerHTML = "Correct!";
			parseInput = false;

		} else {
			document.getElementById("info").style.color = "red";
			document.getElementById("info").innerHTML = "Wrong!";
		}
	} else {
		document.getElementById("info").style.color = "blue";
		document.getElementById("info").innerHTML = "Already Counted!";
	}
	document.getElementById("score").innerHTML = `Score: ${score}/${iteration}`;
}

let updateDelayTime = () => {
	/* These values for DELAY and score are pretty random but you get the idea
	I prefer a gradual decrease so use a linear function. This is discontinous and step-wise
	Add a banner or something that informs users like "Speeding up!"
	*/
	if (score > 100) {
		DELAY = 100;
	} else if (score > 75) {
		DELAY = 500;
	} else if (score > 50 ) {
		DELAY = 750;
	} else if (score > 25) {
		DELAY = 1000;
	} else if (score > 10 ) {
		DELAY = 1200;
	} else {
		DELAY = 2000;
	}
}

let run = (c, staff, timeout = null) => {
	clearCanvas(c);
	// clear previous timeout
	if (timeout) { clearTimeout(timeout); }
	parseInput = true;
	iteration++;
	let randomNote = notes[Math.floor(Math.random() * notes.length)];
	globalRandomNote = randomNote;
	drawStaff(c, staff);
	drawNote(c, randomNote);
	// gradually decrease delay time
	updateDelayTime();
	timeout = setTimeout(() => {
		parseInput = false;
		run(c, staff, timeout);
	}, DELAY);
	document.getElementById("score").innerHTML = `Score: ${score}/${iteration}`;
}

main();


// Implementation of addGrid()
//
// See: https://bucephalus.org/text/CanvasHandbook/CanvasHandbook.html


/*
draws a coordinate grid on the given canvas. It has three parameters:

	delta is the distance of the lines in the grid, given as the number of pixels, with a default value of 25.
	color is a CSS color string that sets the color of the grid and number coordinates. The default color is 'blue'.
	font is a CSS font string to determine the font of the number coordinates. The default font value is '8px sans-serif'
	*/
CanvasRenderingContext2D.prototype.addGrid = function (delta, color, fontParams) {
	// define the default values for the optional arguments
	if (!arguments[0]) { delta = 25; }
	if (!arguments[1]) { color = 'blue'; }
	if (!arguments[2]) { fontParams = '8px sans-serif'; }
	// extend the canvas width and height by delta
	var oldWidth = this.canvas.width;
	var oldHeight = this.canvas.height;
	this.canvas.width = oldWidth + delta;
	this.canvas.height = oldHeight + delta;
	// draw the vertical and horizontal lines
	this.lineWidth = 0.1;
	this.strokeStyle = color;
	this.font = fontParams;
	this.beginPath();
	for (var i = 0; i * delta < oldWidth; i++) {
		this.moveTo(i * delta, 0);
		this.lineTo(i * delta, oldHeight);
	}
	for (var j = 0; j * delta < oldHeight; j++) {
		this.moveTo(0, j * delta);
		this.lineTo(oldWidth, j * delta);
	}
	this.closePath();
	this.stroke();
	// draw a thicker line, which is the border of the original canvas
	this.lineWidth = 0.5;
	this.beginPath();
	this.moveTo(0, 0);
	this.lineTo(oldWidth, 0);
	this.lineTo(oldWidth, oldHeight);
	this.lineTo(0, oldHeight);
	this.lineTo(0, 0);
	this.closePath();
	this.stroke();
	// set the text parameters and write the number values to the vertical and horizontal lines
	this.font = fontParams
	this.lineWidth = 0.3;
	// 1. writing the numbers to the x axis
	var textY = oldHeight + Math.floor(delta / 2); // y-coordinate for the number strings
	for (var i = 0; i * delta <= oldWidth; i++) {
		this.strokeText(i * delta, i * delta, textY);
	}
	// 2. writing the numbers to the y axis
	var textX = oldWidth + 5; // x-coordinate for the number strings
	for (var j = 0; j * delta <= oldHeight; j++) {
		this.strokeText(j * delta, textX, j * delta);
	}
};

	//
	// Implementation ends
	//