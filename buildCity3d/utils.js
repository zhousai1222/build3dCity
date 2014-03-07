// @author zz85
// Boids and Buildings
// http://www.lab4games.net/zz85/blog/2012/11/19/making-of-boids-and-buildings/

// ###############

function Edge(v1, v2, next) {
	this.start = v1;
	this.end = v2;
	this.next = next; // Next Edge
}

// ###############

// see http://paulbourke.net/geometry/lineline2d/
function intersection(road1, road2) {

	var x1 = road1.start.x, x2 = road1.end.x, x3 = road2.start.x, x4 = road2.end.x;
	var y1 = road1.start.y, y2 = road1.end.y, y3 = road2.start.y, y4 = road2.end.y;

	var dem = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
	if (dem == 0 ) return;  // lines are parrallel
	var ua_num = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3);
	var ub_num = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3);

	var ua = ua_num / dem;
	var ub = ub_num / dem;

	// if ua_num == 0 && ub_num == 0 // lines are the same
	if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
		var x = x1 + ua * (x2 - x1);
		var y = y1 + ua * (y2 - y1);
		var v = new THREE.Vector2( x, y );
		v.ua = ua;
		v.ub = ub;

		return v;
	}

	return;

}

// ###################


function area( contour ) {

	var n = contour.length;
	var a = 0.0;

	for( var p = n - 1, q = 0; q < n; p = q++ ) {

		a += contour[ p ].x * contour[ q ].y - contour[ q ].x * contour[ p ].y;

	}

	return a * 0.5;

};


// ###################

// http://paulbourke.net/geometry/polygonmesh/

function getCentroid( vertices, polyarea ) {

	polyarea = (polyarea !== undefined) ? polyarea : area(vertices);

	var centroid = new THREE.Vector2();

	var e1, e2;
	for (var i=0;i<vertices.length-1;i++) {
		e1 = vertices[i];
		e2 = vertices[i+1];

		centroid.x += (e1.x + e2.x) * (e1.x*e2.y-e2.x*e1.y);
		centroid.y += (e1.y + e2.y) * (e1.x*e2.y-e2.x*e1.y);
	}

	centroid.divideScalar( 6 * polyarea );

	return centroid;

};


// ############################

function tripleCheck(edge) {
	var start = edge;

	var tmp = [];

	do {
		tmp.push(edge);
		if (edge.visited) {
			console.log('edge should not be visited!!!');
			// debugger;
			// break;
			var p;
			while(p = tmp.pop()) p.visited = false;
			return;
		}

		edge.visited = true;
		edge = edge.next;
	} while (edge != start);


	edge = start;
	do {
		edge.visited = false;
		edge = edge.next;
	} while (edge != start);
}

function testEdge(edge) {
	if (edge.next) {
		var pass =
			(Math.abs(edge.end.x - edge.next.start.x)<2 &&
			Math.abs(edge.end.y - edge.next.start.y)<2);


		console.assert(pass,
			'links failed this', edge.end, edge.next.start, edge);

		if (!pass) debugger;
	}
}

function doubleCheck() {

	all_roads.forEach(function(road) {
		road.rightEdges.forEach(testEdge);
		road.leftEdges.forEach(testEdge);
	});

}


function detectFaces(all_roads) {

	var faceCount = 0;
	var faces = [];

	function traverseEdge(edge) {


		if (!edge.visited) {
			var start = edge;
			faceCount++;
			var face = [];


			do {
				edge.visited = true;
				face.push(edge);
				edge = edge.next;


			} while (edge && edge!==start && !edge.visited );
			faces.push(face);
		}
	}

	all_roads.forEach(function(road) {
		road.rightEdges.forEach(traverseEdge);
		road.leftEdges.forEach(traverseEdge);
	});

	return faces;

}

function debugFace(edges) {

	context2.clearRect(0, 0, width, height);
	var r = 1.0;
	edges.forEach(function(b) {
		// context2.strokeStyle = 'yellow';
		context2.strokeStyle = 'rgba(0,0,0,?)'.replace(/[?]/g, r);

		r -= 0.1;
		context2.beginPath();
		context2.moveTo(b.start.x,b.start.y);
		context2.lineTo(b.end.x,b.end.y);
		context2.stroke();
		context2.closePath();

		context2.fillStyle = 'blue';
		context2.beginPath();
		context2.arc(b.start.x,b.start.y,1,0,2*Math.PI);
		context2.fill();
		context2.closePath();

		context2.fillStyle = 'purple';
		context2.beginPath();
		context2.arc(b.end.x,b.end.y,1,0,2*Math.PI);
		context2.fill();
		context2.closePath();
	});

}

function debugEdge(c) {

	context2.strokeStyle = 'pink';
	context2.beginPath();
	context2.moveTo(c.start.x,c.start.y);
	context2.lineTo(c.end.x,c.end.y);
	context2.stroke();
	context2.closePath();

	context2.fillStyle = 'green';
	context2.beginPath();
	context2.arc(c.start.x,c.start.y,2,0,2*Math.PI);
	context2.fill();
	context2.closePath();

	context2.fillStyle = 'red';
	context2.beginPath();
	context2.arc(c.end.x,c.end.y,1,0,2*Math.PI);
	context2.fill();
	context2.closePath();

}



function debug() {

	context2.clearRect(0, 0, width, height);

	all_roads.forEach(function(b) {

		b.rightEdges.forEach(debugEdge);
		b.leftEdges.forEach(debugEdge);

	});
}

// var canvas2 = document.createElement('canvas');
// var context2 = canvas2.getContext('2d');

function fullScreenIt(elm, fullScreenEvent) {
	var r = elm.mozRequestFullScreen || elm.webkitRequestFullScreen || elm.requestFullScreen;
	r && r.call(elm);
	// ( document.body.requestFullScreen && window.addEventListener('fullscreenchange',fullScreenEvent) ) || ( document.body.webkitRequestFullScreen && window.addEventListener('webkitfullscreenchange',fullScreenEvent ) ) || ( document.body.mozRequestFullScreen && window.addEventListener('mozfullscreenchange',fullScreenEvent) );
}

function backToWindow() {
	if (document.cancelFullScreen) {
		document.cancelFullScreen();
	} else if (document.mozCancelFullScreen) {
		document.mozCancelFullScreen();
	} else if (document.webkitCancelFullScreen) {
		document.webkitCancelFullScreen();
	}
}