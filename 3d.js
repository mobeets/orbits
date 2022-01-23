let stepSize = 0.1;
let gravityStrength = 10;
let planetRadius = 40;
let planetMode = 0;
let planets = [];

function fx(x) { return x-width/2; }
function fy(y) { return y-height/2; }

function setup() {
  createCanvas(500, 500, WEBGL);
}

class Planet {
  constructor(x,y,r) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.r = r;
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
		push();
		translate(planets[i].pos.x, planets[i].pos.y);
		sphere(planets[i].r);
		pop();
	}
	
	// currently created planet
	if (planetMode === 0) {
		noStroke();
		push();
		translate(fx(mouseX), fy(mouseY));
		sphere(planetRadius);
		pop();
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
}

function gravitationalForce(a, b) {
	let dsq = Math.pow(a.pos.dist(b.pos), 2);

	let F = gravityStrength * -a.mass*b.mass/dsq;
	let u = createVector(a.pos.x-b.pos.x, a.pos.y-b.pos.y);
	
	return u.normalize().mult(F);
}

function mouseClicked() {
	if (planetMode === 0) {
		let curPlanet = new Planet(fx(mouseX), fy(mouseY), planetRadius);
		planets.push(curPlanet);
	}
}
