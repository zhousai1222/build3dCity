// @author zz85
// Boids and Buildings
// http://www.lab4games.net/zz85/blog/2012/11/19/making-of-boids-and-buildings/

function gete(id) {
	return document.getElementById(id);
}

function getc(id) {
	return document.getElementsByClassName(id);
}


var started;
function showstart() {
	if (started) return;
	if (!hasWebgl) return;
	started = true;
}

function showfail() {
	hideall();
//	gete('fail').style.display = 'block';
}



function hideall() {
	var starts = getc('all');
	for (var i=0;i<starts.length;i++) {
		starts[i].style.display = 'none';
	}
}




var placeholder = document.getElementById('placeholder');

var land, current;

var plan = 0;

function styleIt(style, key, value) {
	style[key] = value;
	style['-webkit-' + key] = value;
	style['-moz-' + key] = value;
}

land = new Land(1024, 1024, {}, {
    frequency: 0.2,
    limit: 100,
    max: 10000
});
placeholder.appendChild(land.canvas);

var hasWebgl = ( function () { try { return !! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' ); } catch( e ) { return false; } } )();

if (!hasWebgl) {
	showfail();
} else {
	init();
}

////music = document.getElementById('background');
////music.addEventListener('loadeddata', showstart, false);

////if (music.buffered.length>0) showstart();


function start() {
	clearInterval(current);
	document.body.style.backgroundColor = '#333';
	gete('placeholder').style.display = 'none';
	
	/*DEBUG*/
	// FULL_SCREEN = false;

	if (FULL_SCREEN) {
		fullScreenIt(document.body, onWindowResize);
	}

	initBirds();
	animate();

	director.start();

	/* DEBUG */
	// rebuildCities();
	// cameraMode = CAMERA_BOID;
	// startAudio();
	// gete('playcontrols').style.display = 'block';

}



function updateoptions() {
	LESS_BUILDINGS = gete('lessbuilidngs').checked;
	BOID_COUNT = gete('lessboids').checked ? 10 : 20;
	POSTPROCESSING = !gete('nopostprocessing').checked;
	NO_MUSIC = gete('nomusic').checked;
	NO_AUDIO = gete('noaudio').checked;

	// gete('noaudio').checked,
	SHOW_STATS = gete('showstats').checked;
	stats.domElement.style.display = SHOW_STATS ? 'block' : 'none';
	FULL_SCREEN = !gete('nofullscreen').checked;
}