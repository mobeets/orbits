let windowWidth;
let windowHeight;
let aRad = 10;
let bRad = 50;
let step = 0.2;
let showHistory = true;
let centerMode = 'bary';
let maxHistoryLength = 2500;
let aColor;
let bColor;

let mode;
let a, b, origin, va, vb;
let aMass, bMass;
let history;

function setup() {
	windowWidth = displayWidth;
	windowHeight = displayHeight-150;
	createCanvas(windowWidth, windowHeight);
	aColor = color('rgba(255, 255, 255, 0.8)');
	bColor = color('rgba(255, 0, 0, 0.8)');
	$('#togBtn-history').change(updateHistory);
	$('#reset').click(reset);
	reset();
	mode = 1;
}

function draw() {
	clear();
	background('black');

	// draw cross at origin/barycenter
	stroke('white');
	line(origin.x-5, origin.y, origin.x+5, origin.y);
	line(origin.x, origin.y-5, origin.x, origin.y+5);

	// show history
	if (mode >= 4 && showHistory) {
		for (var i = 0; i < history.length-1; i++) {
			stroke(aColor);
			line(history[i][0], history[i][1], history[i+1][0], history[i+1][1]);
			stroke(bColor);
			line(history[i][2], history[i][3], history[i+1][2], history[i+1][3]);
		}
	}

	// draw planet A
	noStroke();
	fill(aColor);
	ellipse(a.x, a.y, aRad);

	// draw planet B
	fill(bColor);
	if (mode === 1) {
		b.x = constrain(mouseX, origin.x, windowWidth);
		bRad = getRadiusForBarycenterAtOrigin(a.x, b.x);
		bMass = getMass(bRad);
	}
	ellipse(b.x, b.y, bRad);

	// pick/draw velocity of A
	stroke(aColor);
	if (mode === 2) {
		va.x = mouseX - a.x;
		va.y = mouseY - a.y;
	}
	if (mode <= 3 || showVelocities()) {
		line(a.x, a.y, a.x + va.x, a.y + va.y);
	}

	// pick/draw velocity of B
	stroke(bColor);
	if (mode === 3) {
		vb.x = mouseX - b.x;
		vb.y = mouseY - b.y;
	}
	if (mode <= 3 || showVelocities()) {
		line(b.x, b.y, b.x + vb.x, b.y + vb.y);
	}

	// todo: show history of all points over time

	// animate
	if (mode === 4) {
		let d = a.dist(b);
		let u = createVector(b.x-a.x, b.y-a.y);
		u.normalize();
		F = -aMass*bMass/d;
		// F = m*a -> a = F/m
		
		va.x -= step*(F/aMass)*u.x;
		va.y -= step*(F/aMass)*u.y;
		vb.x += step*(F/bMass)*u.x;
		vb.y += step*(F/bMass)*u.y;

		a.x += step*va.x;
		a.y += step*va.y;
		b.x += step*vb.x;
		b.y += step*vb.y;

		if (centerMode.localeCompare('bary') == 0) {
			// center view around barycenter
			let c = getBarycenter(a, b, aMass, bMass);
			let offset = createVector(origin.x - c.x, origin.y - c.y);
			a.add(offset);
			b.add(offset);
		} else if (centerMode.localeCompare('b') == 0) {
			let offset = createVector(origin.x - b.x, origin.y - b.y);
			a.add(offset);
			b.add(offset);
		}
		
		history.push([a.x, a.y, b.x, b.y]);
		while (history.length > maxHistoryLength) {
			history = history.slice(1);
		}
	}
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

function updateHistory() {
	showHistory = $('#togBtn-history').is(':checked');
	history = [];
}

function showVelocities() {
	return $('#togBtn-velocity').is(':checked');
}

function mouseClicked() {
	if (mode <= 3) {
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


