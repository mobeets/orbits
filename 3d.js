// todo: add back in centering

let stepSize = 0.1;
let gravityStrength = 10;
let planetRadius = 40;
let showHistory = true;
let planetColor = 'white';
let centerMode = 'barycenter';
let planetMode = 0;
let maxHistoryLength = 200;
let showPlanets = true;
let curPlanet;
let planets = [];
let history = [];
let oldPlanets = [];
let clickedCursorPos;

function fx(x) { return x-width/2; }
function fy(y) { return y-height/2; }

function setup() {
	createCanvas(800, 600, WEBGL);
	$('#reset').click(reset);
	$('#gravity').change(updateGravity);
	$('#step-size').change(updateStepsize);
	$('#togBtn-history').change(updateHistory);
	$('#togBtn-planets').change(updatePlanetVisibility);
	$('a.viewpoint').click(updateViewpoint);

	$('#togBtn-history').click();
	$('#togBtn-planets').click();
}

function reset() {
	oldPlanets = planets;
	planets = [];
	history = [];
}

function updateGravity() {
	gravityStrength = $('#gravity').val() / 5;
}

function updateStepsize() {
	stepSize = $('#step-size').val() / 500;
}

function updateHistory() {
	showHistory = $('#togBtn-history').is(':checked');
	history = [];
}

function updatePlanetVisibility() {
	showPlanets = $('#togBtn-planets').is(':checked');
}

function updateViewpoint() {

	let anchor = $(this).attr("href");
	if (anchor.localeCompare('#barycenter') == 0) {
		centerMode = 'barycenter';
	} else if (anchor.localeCompare('#planet') == 0) {
		centerMode = 'planet';
	} else {
		centerMode = 'absolute';
	}
	$('#current-view').html(centerMode);
	updateHistory();
}

function mouseClicked() {
	if (mouseX < 0 || mouseY < 0 || mouseX > width || mouseY > height) {
		return;
	}
	if (planetMode <= 1) { // add new planet
		if (planets.length > 0) {
			planetColor = 'red';
		} else {
			planetColor = 'white';
		}
		curPlanet = new Planet(fx(clickedCursorPos.x), fy(clickedCursorPos.y), planetRadius, planetColor);
		planets.push(curPlanet);
		planetMode = 2;
	} else if (planetMode === 2) { // choose velocity
		curPlanet.vel = createVector(fx(mouseX)-curPlanet.pos.x, fy(mouseY)-curPlanet.pos.y);
		planetMode = 0;
	}
}

function keyPressed() {
	if (planetMode === 2 && keyCode === ESCAPE) {
		// keep initial velocity of zero
		planetMode = 0;
	}
}

function mousePressed() {
	if (mouseX < 0 || mouseY < 0 || mouseX > width || mouseY > height) {
		return;
	}
	if (planetMode === 0) {
		// save clicked position for new planet's location
		planetMode = 1;
		clickedCursorPos = createVector(mouseX, mouseY);
	}
}

function mouseDragged() {
	if (planetMode === 1) {
		// adjusts planet's radius by dragging
		planetRadius = createVector(mouseX, mouseY).dist(clickedCursorPos);
	}
}

function takeViewpoint() {
	let origin = createVector(0, 0);
	if (centerMode.localeCompare('barycenter') == 0) {
		// center view around barycenter
		let c = getBarycenter();
		let offset = createVector(origin.x - c.x, origin.y - c.y);
		for (var i = 0; i < planets.length; i++) {
			planets[i].pos.add(offset);
		}
	} else if (centerMode.localeCompare('planet') == 0) {
		let c = planets[0].pos;
		let offset = createVector(origin.x - c.x, origin.y - c.y);
		for (var i = 0; i < planets.length; i++) {
			planets[i].pos.add(offset);
		}
	}
}

function getBarycenter() {
	let totalMass = 0;
	for (var i = 0; i < planets.length; i++) {
		totalMass += planets[i].mass;
	}
	let c = createVector(0, 0);
	for (var i = 0; i < planets.length; i++) {
		let p = planets[i].mass/totalMass;
		c.x += p*planets[i].pos.x;
		c.y += p*planets[i].pos.y;
	}
	return c;
}

class Planet {
  constructor(x, y, r, clr) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.r = r;
    this.clr = clr;
  }

  get mass() {
    return 100*this.r;
  }

  applyForce(f) {
  	this.vel.x += stepSize*f.x/this.mass;
  	this.vel.y += stepSize*f.y/this.mass;
  }

  updatePosition() {
  	this.pos.x += stepSize*this.vel.x;
  	this.pos.y += stepSize*this.vel.y;
  }
}

function draw() {
	background(0);
	
	// light source
	if (planets.length > 0) {
		pointLight(250, 250, 250, planets[0].pos.x, planets[0].pos.y, 3*planets[0].r);
	}

	// draw all created planets
	if (planets.length < 2 || planetMode > 0 || showPlanets) {
		for (var i = 0; i < planets.length; i++) {
			noStroke();
			fill(planets[i].clr);
			push();
			translate(planets[i].pos.x, planets[i].pos.y);
			sphere(planets[i].r);
			pop();
		}
	}
	
	// currently created planet
	if (planetMode <= 1) {
		noStroke();
		push();
		if (planetMode === 0) {
			translate(fx(mouseX), fy(mouseY));
		} else {
			translate(fx(clickedCursorPos.x), fy(clickedCursorPos.y));
		}
		sphere(planetRadius);
		pop();
	} else if (planetMode === 2) {
		stroke(curPlanet.clr);
		line(curPlanet.pos.x, curPlanet.pos.y, fx(mouseX), fy(mouseY));
	}

	if (planetMode > 0) { return; }
	if (planets.length < 2) { return; }

	// show history
	if (showHistory) {
		for (var i = 0; i < history.length-1; i++) {
			let c = 0;
			for (var j = 0; j < planets.length; j++) {
				stroke(planets[j].clr);
				if (c >= history[i].length) {
					continue;
				}
				line(history[i][c], history[i][c+1], history[i+1][c], history[i+1][c+1]);
				c += 2;
			}
		}
	}

	// calculate forces
	for (var i = 0; i < planets.length; i++) {
		let f = createVector(0, 0);
		for (var j = 0; j < planets.length; j++) {
			if (i != j) {
				f.add(gravitationalForce(planets[i], planets[j]));
			}
		}
		planets[i].applyForce(f);
	}
	// apply forces
	for (var i = 0; i < planets.length; i++) {
		planets[i].updatePosition();
	}
	// check for collisions
	for (var i = 0; i < planets.length; i++) {
		for (var j = 0; j < planets.length; j++) {
			if (i != j && planets[i].pos.dist(planets[j].pos) < min(planets[i].r, planets[j].r)) {
				planets[i].vel.x = 0;
				planets[i].vel.y = 0;
				planets[j].vel.x = 0;
				planets[j].vel.y = 0;
			}
		}
	}

	takeViewpoint();

	let cHistory = [];
	for (var i = 0; i < planets.length; i++) {
		cHistory.push(planets[i].pos.x);
		cHistory.push(planets[i].pos.y);
	}
	history.push(cHistory);
	while (history.length > maxHistoryLength) {
		history = history.slice(1);
	}
}

function gravitationalForce(a, b) {
	let dsq = Math.pow(a.pos.dist(b.pos), 2);
	if (dsq < Math.pow(min(a.r, b.r), 2)) {
		return createVector(0,0);
	}

	let F = gravityStrength * -a.mass*b.mass/dsq;
	let u = createVector(a.pos.x-b.pos.x, a.pos.y-b.pos.y);
	
	// console.log([u.x, u.y, 
	u = u.normalize().mult(F);
	return u;
}
