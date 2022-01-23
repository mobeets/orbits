let windowWidth;
let windowHeight;
let aRad = 10;
let bRad = 50;
let step = 0.1;
let gravityStrength = 10;
let showHistory = true;
let centerMode = 'barycenter';
let maxHistoryLength = 2500;

let animateMode = 5;
let aColor;
let bColor;
let mode;
let a, b, origin, va, vb;
let aMass, bMass;
let history;

// todo:
// - mobile doesn't let you choose planet size
// - gravity for multiple planets
// - functionality to add/remove multiple planets
// - click, drag, and throw planets to initialize?
// - I think orbits should be closed and not like a spirograph; what is going wrong with my code?
// - make planet B a light source? (involves making planet A a sphere, and then adding a point light wherever planet B is)
// - make lines neon? # https://www.youtube.com/watch?v=iIWH3IUYHzM
// some kind of error happening when they get too close -- they bend
// 

function setup() {
	windowWidth = displayWidth/2;
	windowHeight = displayHeight-150;
	createCanvas(windowWidth, windowHeight, WEBGL);
	// aColor = color('rgba(255, 80, 255, 0.8)');
	// bColor = color('rgba(255, 0, 0, 0.8)');
	aColor = color('rgba(255, 80, 255, 1.0)');
	bColor = color('rgba(255, 0, 0, 1.0)');
	$('#togBtn-history').change(updateHistory);
	$('#reset').click(reset);
	$('a.viewpoint').click(changeViewpoint);
	$('#gravity').change(updateGravity);
	$('#step-size').change(updateStepsize);

	reset();
	mode = 1;
	$('#togBtn-history').click();
}

function draw() {
	translate(-origin.x, -origin.y);
	clear();
	background('black');

	// draw cross at origin/barycenter
	// stroke('white');
	// line(origin.x-5, origin.y, origin.x+5, origin.y);
	// line(origin.x, origin.y-5, origin.x, origin.y+5);

	// show history
	if (mode >= animateMode && showHistory) {
		for (var i = 0; i < history.length-1; i++) {
			stroke(aColor);
			line(history[i][0], history[i][1], history[i+1][0], history[i+1][1]);
			stroke(bColor);
			line(history[i][2], history[i][3], history[i+1][2], history[i+1][3]);
		}
	}

	// draw planet B
	if (mode === 1) {
		// b.x = constrain(mouseX, origin.x, windowWidth);
		b.x = mouseX;
		b.y = mouseY;
	}
	// pick planet B's radius
	if (mode === 2) {
		bRad = createVector(mouseX, mouseY).dist(b);
		bMass = getMass(bRad);
	}
	fill(bColor);
	noStroke();
	push();
	translate(b.x, b.y);
	sphere(bRad);
	pop();
	// ellipse(b.x, b.y, bRad);

	pointLight(250, 250, 250, b.x, b.y, bRad);

	// draw planet A
	fill(aColor);
	noStroke();
	push();
	translate(a.x, a.y);
	sphere(aRad);
	pop();
	// ellipse(a.x, a.y, aRad);
	
	// pick/draw velocity of A
	stroke(aColor);
	if (mode === 3) {
		va.x = mouseX - a.x;
		va.y = mouseY - a.y;
	}
	if (mode <= 4 || showVelocities()) {
		line(a.x, a.y, a.x + va.x, a.y + va.y);
	}

	// pick/draw velocity of B
	stroke(bColor);
	if (mode === 4) {
		vb.x = mouseX - b.x;
		vb.y = mouseY - b.y;
	}
	if (mode <= 4 || showVelocities()) {
		line(b.x, b.y, b.x + vb.x, b.y + vb.y);
	}

	// animate
	if (mode === animateMode) {
		updatePlanets();

		centerAtOrigin();
		
		history.push([a.x, a.y, b.x, b.y]);
		while (history.length > maxHistoryLength) {
			history = history.slice(1);
		}
	}
}

function updatePlanets() {
	let f = gravitationalForce(a, b, aMass, bMass);

	// F = m*a -> a = F/m
	va.x -= step*f.x/aMass;
	va.y -= step*f.y/aMass;
	vb.x += step*f.x/bMass;
	vb.y += step*f.y/bMass;

	a.x += step*va.x;
	a.y += step*va.y;
	b.x += step*vb.x;
	b.y += step*vb.y;	
}

function gravitationalForce(a, b, aMass, bMass) {
	let dsq = Math.pow(a.dist(b), 2);
	let F = gravityStrength * -aMass*bMass/dsq;
	let u = createVector(b.x-a.x, b.y-a.y);
	return u.normalize().mult(F);
}

function centerAtOrigin() {
	if (centerMode.localeCompare('barycenter') == 0) {
		// center view around barycenter
		let c = getBarycenter(a, b, aMass, bMass);
		let offset = createVector(origin.x - c.x, origin.y - c.y);
		a.add(offset);
		b.add(offset);
	} else if (centerMode.localeCompare('planet') == 0) {
		let offset = createVector(origin.x - b.x, origin.y - b.y);
		a.add(offset);
		b.add(offset);
	}
}

function getBarycenter(a, b, ma, mb) {
	let p = ma/(ma+mb);
	let cx = p*a.x + (1-p)*b.x;
	let cy = p*a.y + (1-p)*b.y;
	return createVector(cx, cy);
	// use this to get barycenter before
	// and barycenter after a step of velocity
	// and then use that to figure out b's velocity
	// that would keep barycenter const
}

function reset() {
	mode = 0;
	a = createVector(windowWidth/4, windowHeight/2);
	b = createVector(0, windowHeight/2);
	origin = createVector(windowWidth/2, windowHeight/2);
	aMass = getMass(aRad);
	bMass = getMass(bRad);
	va = createVector(0, 0);
	vb = createVector(0, 0);
	history = [];
}

function changeViewpoint() {

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
	if (mode < animateMode) { reset(); }
}

function updateGravity() {
	gravityStrength = $('#gravity').val() / 5;
}

function updateStepsize() {
	step = $('#step-size').val() / 500;
}

function updateHistory() {
	showHistory = $('#togBtn-history').is(':checked');
	history = [];
}

function showVelocities() {
	return $('#togBtn-velocity').is(':checked');
}

function mouseClicked() {
	if (mode <= 4) {
		mode++;
	}
}

function getMass(rad) {
	return 100*rad;
}

function getRadiusForBarycenterAtOrigin(aX, bX) {
	// given (aX,0), (bX,0), find the radius of b such that the barycenter is at the origin
	let d = bX - aX;
	let r1 = bX - origin.x;

	// r1 = d*m2/(m1+m2)
	// r1*m1 + r1*m2 = d*m2
	// r1*m1 = m2*(d-r1)
	// m1 = m2*(d-r1)/r1
	return aRad*(d-r1)/r1;
}
