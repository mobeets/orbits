let stepSize = 0.1;
let gravityStrength = 10;
let planetRadius = 40;
let planetColor = 'white';
let planetMode = 0;
let planets = [];
let history = [];
let oldPlanets = [];
let clickedCursorPos;

function fx(x) { return x-width/2; }
function fy(y) { return y-height/2; }

function setup() {
	createCanvas(500, 500, WEBGL);
	$('#reset').click(reset);
	$('#gravity').change(updateGravity);
	$('#step-size').change(updateStepsize);
	$('#togBtn-history').change(updateHistory);
}

function reset() {
	oldPlanets = planets;
	planets = [];
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

function mouseClicked() {
	if (mouseX < 0 || mouseY < 0 || mouseX > width || mouseY > height) {
		return;
	}
	if (planetMode >= 0) { // add new planet
		let curPlanet = new Planet(fx(clickedCursorPos.x), fy(clickedCursorPos.y), planetRadius, planetColor);
		planetColor = 'red';
		planets.push(curPlanet);
		planetMode = 0;
	}
}

function mousePressed() {
	planetMode = 1;
	clickedCursorPos = createVector(mouseX, mouseY);
}

function mouseDragged() {
	planetRadius = createVector(mouseX, mouseY).dist(clickedCursorPos);
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
	for (var i = 0; i < planets.length; i++) {
		noStroke();
		fill(planets[i].clr);
		push();
		translate(planets[i].pos.x, planets[i].pos.y);
		sphere(planets[i].r);
		pop();
	}
	
	// currently created planet
	if (planetMode >= 0) {
		noStroke();
		push();
		if (planetMode === 0) {
			translate(fx(mouseX), fy(mouseY));
		} else {
			translate(fx(clickedCursorPos.x), fy(clickedCursorPos.y));
		}
		sphere(planetRadius);
		pop();
	}

	// calculate forces
	let forces = [];
	for (var i = 0; i < planets.length; i++) {
		let f = createVector(0, 0);
		for (var j = 0; j < planets.length; j++) {
			if (i != j) {
				f.add(gravitationalForce(planets[i], planets[j]));
			}
		}
		forces.push(f);
	}
	// apply forces
	for (var i = 0; i < planets.length; i++) {
		planets[i].applyForce(forces[i]);
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
