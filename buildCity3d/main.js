// @author zz85
// Boids and Buildings
// http://www.lab4games.net/zz85/blog/2012/11/19/making-of-boids-and-buildings/

var cameraMode = 0;

var targetCamera = new THREE.Vector3();
var lookAt = new THREE.Vector3();

var music, director;

var stats;

// ########################

var width = 512;
var height = 512;

var BOID_COUNT =    20;
var POSTPROCESSING = true;
var LESS_BUILDINGS = false;
var NO_MUSIC = false;
var SHOW_STATS = false;
var FULL_SCREEN = true;
var NO_AUDIO = false;

var CONSTRUCTION_DELAY = 5000;

//materials
var materials = [];

/// THREE.js
var countyBoundary = 40;
var plane;
var camera, controls, scene, renderer;

var landWidth = 1000;
var startBuilding;
var lands = [];
var birds, boids;

////the center
var theCenter;
var theCenter_speed = 0.01;
var theCenter_done = false;

var ambientLight, directionalLight, pointlight;

var targetWidth, targetHeight, halfWidth, halfHeight;
var mouseX, mouseY, moveX, moveY, steerX, steerY = 0;

var topspace = 100;

var random = Math.random, sin = Math.sin, cos = Math.cos;
var tramRoute;

var CAMERA_MOVIE = 0,
CAMERA_BOID = 1,
CAMERA_HAWK = 2,
CAMERA_FPS = 3,
CAMERA_ORBIT = 4,
CAMERA_TRAM = 5;

var paused = false;
var ended = false;

var landLease = [];

var brand_materials = [];
var brand_textures = [];

function onWindowResize(e) {

	targetWidth = window.innerWidth;
	targetHeight = window.innerHeight - topspace * 2;
	halfWidth = targetWidth / 2;
	halfHeight = targetHeight / 2;

	camera.aspect = targetWidth / targetHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( targetWidth, targetHeight );


}

function init() {

	targetWidth = window.innerWidth;
	targetHeight = window.innerHeight - topspace * 2;
	halfWidth = targetWidth / 2;
	halfHeight = targetHeight / 2;
	steerX = steerY = 0;
	camera = new THREE.PerspectiveCamera(300, 1, 1, 10000);

	//var w = 1920;
	//var h = 1080;
	//var fullWidth = w * 2;
	//var fullHeight = h * 1;

    //// A
	//camera.setViewOffset(fullWidth, fullHeight, w * 0, h * 0, w, h);
    //// B
	//camera.setViewOffset(fullWidth, fullHeight, w * 1, h * 0, w, h);

                                             
	camera.setLens(35);
	camera.position.set( 700, 50, 200 );
        
	controls = new THREE.FirstPersonControls( camera );

	controls.lookSpeed = 0.0125;
	controls.movementSpeed = 150;
	// controls.noFly = false;
	controls.lookVertical = true;
	controls.constrainVertical = true;
	controls.verticalMin = 1.5;
	controls.verticalMax = 2.0;

	controls.lon = -110;

	scene = new THREE.Scene();

    // floor covering

	//var texture = THREE.ImageUtils.loadTexture("Assets/Images/ground.jpg");
	//texture.wrapS = THREE.RepeatWrapping;
	//texture.wrapT = THREE.RepeatWrapping;
	//texture.repeat.set(10, 10);

	earth = new THREE.Mesh( new THREE.PlaneGeometry( landWidth * 20, landWidth *20 ), new THREE.MeshLambertMaterial( { color: 0xbbbbbb, side:THREE.DoubleSide} ) );
	earth.rotation.x = - Math.PI / 2;
	earth.position.y = -1;

	scene.add(earth);

    //sky
	//var imagePrefix = "Assets/Images/sky/dawnmountain-";
	//var directions = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
	//var imageSuffix = ".png";
	//var skyGeometry = new THREE.CubeGeometry(10000, 10000, 10000);

	//var materialArray = [];
	//for (var i = 0; i < 6; i++)
	//    materialArray.push(new THREE.MeshBasicMaterial({
	//        map: THREE.ImageUtils.loadTexture(imagePrefix + directions[i] + imageSuffix),
	//        side: THREE.BackSide
	//    }));
	//var skyMaterial = new THREE.MeshFaceMaterial(materialArray);
	//var skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
	//scene.add(skyBox);


	// Lights

	ambientLight = new THREE.AmbientLight( 0x333333 );
	scene.add( ambientLight );


	directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
	directionalLight.position.set( 1, 1, 1 ).normalize();
	scene.add(directionalLight);


	directionalLight = new THREE.DirectionalLight(0x555555, 1);
	directionalLight.position.set(-1, -1, -1).normalize();
	scene.add(directionalLight);

	pointlight = new THREE.PointLight( 0xffffff, 1 );
	pointlight.position.set( -100, 200, -100 );
	scene.add( pointlight );

    ////model
	//var loader = new THREE.OBJMTLLoader();
	//loader.load('Assets/Model/PanGu/pangu.obj', 'Assets/Model/PanGu/pangu.mtl', function (object) {
	//    object.position.y = 100;
	//    theCenter = object;
	//    theCenter.scale.y = 0;
	//    scene.add(object);
    //});

    // fog
	//var loader = new THREE.OBJLoader();
	//loader.load('Assets/1obj.obj', function (object) {

	//    object.traverse(function (child) {

	//        if (child instanceof THREE.Mesh) {

	           
	//            child.material = new THREE.MeshBasicMaterial({ color: 0x00ee00, wireframe: true});

	//        }

	//    });

	//    object.position.y = 0;
	//    scene.add(object);

	//});



	scene.fog = new THREE.Fog( 0xfefefe, 1000, 8000 );
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( targetWidth, targetHeight);


	renderer.autoClear = false;
	renderer.setClearColor( scene.fog.color, 1 );

	window.addEventListener( 'resize', onWindowResize, false );

	// Create Virtual birds
	initAnimation();

	document.body.appendChild( renderer.domElement );

	renderer.domElement.style.cssText = "position:absolute;top:" + topspace + "px;";
	scene.add(camera);

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	stats.domElement.style.display = 'none';
	document.body.appendChild( stats.domElement );

	tramRoute = new THREE.Shape();

	var w = landWidth / 2 + countyBoundary /2;
	tramRoute.moveTo(-w, -w);
	tramRoute.lineTo(w, -w);
	tramRoute.lineTo(w, w);
	tramRoute.lineTo(-w, w);
	tramRoute.lineTo(-w, -w);

	renderer.domElement.addEventListener( 'mousemove', mouseMoving, false );

	start();


	initBrand();
   
}

var ad_mesh;
function initBrand() {
    var brand_size = 4;
    for (var i = 1; i < 5; i++) {
        var name = "Assets/Images/brand/brand" + i+".jpg";
        brand_textures[i - 1] = THREE.ImageUtils.loadTexture(name);
      

    }

    var loader = new THREE.OBJMTLLoader();
    loader.load('Assets/Model/ad/ad.obj', 'Assets/Model/ad/ad.mtl', function (object) {
        ad_mesh = object;
        
    });
}

function mouseMoving( event ) {

	mouseX = event.pageX - renderer.domElement.offsetLeft - halfWidth;
	mouseY = event.pageY - renderer.domElement.offsetTop - halfHeight;
	moveX = mouseX/halfWidth;
	moveY = mouseY/halfHeight;

};

function initBirds() {
	birds = [];
	boids = [];

	function rand() {
		return random() * 2 - 1;
	}

	for ( var i = 0; i < BOID_COUNT; i ++ ) {

		boid = boids[ i ] = new Boid();
		boid.position.x = rand() * landWidth / 3 ;
		boid.position.y = random() * 400 + 100;
		boid.position.z = rand() * landWidth / 3;
		boid.velocity.x = rand() * 2;
		boid.velocity.y = rand() * 2;
		boid.velocity.z = rand() * 0.5;
		boid.setAvoidWalls( true );
		boid.setWorldSize( landWidth, 500, landWidth );

		bird = birds[ i ] = new THREE.Mesh( new Bird(), new THREE.MeshLambertMaterial( { color: 0x666666, side: THREE.DoubleSide } ) );
		bird.phase = Math.floor( random() * 62.83 );
		bird.position = boids[ i ].position;
		scene.add( bird );
	}
}
var many = 4;
function initAnimation() {
	// console.log('start');

	var radius = 550, radius2 = 400, h2 = 650,
	// 900
	w2 = 26.5-10;

	director = new THREE.Director();
	gete('playcontrols').style.display = 'block';
	director
    .addTween(0, 5, directionalLight, {intensity:0}, {intensity:1}, 'linear', function(k) {
            })
	.addAction(0, function() {
	    // start building
	    lookAt.use = true;
	    lookAt.set(0, 50, 0);
	   // addNewLand(0, 0);
	    var f = function(x, y) {
	    	return function() {
	    		addNewLand(x, y);
	    	};
	    }
	    var count = 0;
	    var pers_count = 5;
	    var start_time = 0;
	   for (var y=-many; y<=many; y++) {
			for (var x=-many; x<=many; x++) {
			
			    //director.addAction(8+random()*12, f(x, y));

			    //if (x <= 1 && x >= -1) {
			    //    if (y<=1&&y>=-1) {
			    //        if (x===0&&y===0) {
			    //            var loader = new THREE.OBJMTLLoader();

			    //            loader.load('Assets/Model/ZGC/zhongguancun_region.obj', 'Assets/Model/ZGC/zhongguancun_region.mtl', function (object) {
			    //                var i;
			    //                for (i = 0; i < object.children.length; i++) {
			    //                    object.children[i].material.transparent = true;
			    //                }
			    //                scene.add(object);

			    //                object.scale.x = 3.5;
			    //                object.scale.y = 3.5;
			    //                object.scale.z = 3.5;

			    //                object.position.y += 50;
			    //            });
			    //        }
			    //        continue;
			    //    }
			    //}
				setTimeout(f(x,y),start_time);
				count++;
				if (count===pers_count) {
				    count = 0;
				    start_time++;
				}
				// 18 - 30s
			}
		}
	})
	.addAction(0, function() {
		// top view
		camera.position.set(0, 1000, 0);
	})

	.addAction(2, function() {
		// spy view
		camera.position.set(0, 400, 0);
	})
	.addAction(4, function() {
		// satelite view
		camera.position.set(100, 1200, 0);
	})
	.addAction(6, function() {
		// back to diagonal view
		camera.position.set(500, 400, 500);
	})
	.addAction(5, function() {


	})
	// cross the terrian
	.addTween(8, 4, camera.position, {}, {x:300 , y: 80, z: -2000}, 'cubicInOut')
	.addTween(8, 4, camera, {lens: 35}, {lens: 100}, 'cubicInOut', function(k) {
		camera.setLens(camera.lens);
	})
	.addTween(8, 4, lookAt, {}, {x:300 , y: 80, z: 2000}, 'linear')

	.addAction(12, function(k) {
		lookAt.use = !true;
		
	})
	.addTween(12, 4.5, camera.position, {}, {x: -300}, 'linear')
	.addAction(16.5, function() {
		lookAt.set(0,-150,0);
		lookAt.use = true;
	})
	// 26.5
	.addTween(w2, 2, camera, null, {lens: 24}, 'linear', function(k) {
		// zoom out
		lookAt.use = true;
		camera.setLens(camera.lens);
		lookAt.y = -150;
	})
	.addTween(w2, 2, camera.position, null, {x: radius, y: h2, z: -radius}, 'linear')
	.addTween(w2+2, 2, camera.position, null, {x: radius, y: h2, z: radius}, 'cubicInOut')
	.addTween(w2+4, 2, camera.position, null, {x: -radius, y: h2, z: radius}, 'cubicInOut')
	.addTween(w2+6, 2, camera.position, null, {x: -radius, y: h2, z: -radius}, 'cubicInOut')
	.addTween(w2+8, 2, camera.position, null, {x: -radius, y: h2+400, z: -radius}, 'cubicInOut')
	.addTween(w2+10, 2, camera.position, null, {x: radius, y: h2+400, z: -radius}, 'cubicInOut')
	.addTween(w2+12, 2, camera.position, null, {x: radius, y: h2+800, z: -radius}, 'linear')
	.addTween(w2+14, 2, camera, null, {lens:16}, 'linear')

	.addAction(32, function() {
		lookAt.y = 50;
		camera.setLens(16);
	})
	.addTween(32, 8, camera, {lens: 16}, {lens: 24}, 'linear')


	.addAction(40, function() {
		// Switch to boid cameras
		cameraMode = 1;
		camera.setLens(28);
	////	startAudio();
	})
	.addTween(40, 12, null, null, null, 'linear', function() {
		boid = boids[0];
		
	});

}

function addNewLand(x, y) {

	var dist = (x * x + y * y);

	var slight_factor = Math.pow(1/(dist+1), 0.3);
	var land = new Land(width, height, roadsAreDone, {
		// width/(dist+1)
		frequency: Math.max(0.12 * slight_factor, 0.05),
		limit: 40,
		max: 300 * slight_factor
	});

	land.factor = (dist+1);

	land.brand_finished = false;
	land.building_index = 0;
	land.selected_mesh_index = 0;

	land.init();

	var landTexture = new THREE.Texture( land.canvas );

	var landObject = new THREE.Object3D();
//base
	land.buildings = new THREE.Object3D();

	land.buildings_base = new THREE.Object3D();

	land.landTexture = landTexture;

    var material = new THREE.MeshLambertMaterial( { map: landTexture ,transparent:true} );
	//var material=new THREE.MeshBasicMaterial({ color: 0x00ee00, wireframe: true, transparent: true });

	var maxAnisotropy = renderer.getMaxAnisotropy();

	plane = new THREE.Mesh( new THREE.PlaneGeometry( landWidth, landWidth ), material );
	material.anisotropy = maxAnisotropy / 2;
	material.transparent = true;

	landObject.add(plane);
	landObject.add(land.buildings);
    //base
	landObject.add(land.buildings_base);

	landTexture.needsUpdate = true;
	plane.rotation.x = - Math.PI / 2;
	landObject.position.x = x * (landWidth + countyBoundary);
	landObject.position.z = y * (landWidth + countyBoundary);
	scene.add( landObject );

	lands.push(land);

	// var LAND_DELAY = dist * random() * 10000; // up to 20 seconds diff
	// setTimeout(updateLand(land), LAND_DELAY);

	updateLand(land)();
}

function updateLand(land, landTexture) {
	return function() {
		land.run = setInterval(function() {
			land.update();
			land.landTexture.needsUpdate = true;
		} , 1000 / 20);
	}
}


function animate(timestamp) {

	requestAnimationFrame( animate );

	if (!timestamp) timestamp = Date.now();
	render(timestamp);

}

var laststamp = Date.now();
var brand_index = 0;
var texture = THREE.ImageUtils.loadTexture("Assets/Images/checkerboard.jpg");
function render(timestamp) {

	var delta = timestamp - laststamp;
	laststamp = timestamp;

	if (paused) return;

	director.update();
	var land;
    //land grow
	for (var l=0;l<lands.length;l++) {
		land = lands[l];
		if (land.done) {
		    if (!land.brand_finished) {
		        land.brand_finished = true;
		       
		     //   land.max_area_mesh.material = new THREE.MeshLambertMaterial({ map: texture });
		        land.brand = ad_mesh.clone();
		        land.brand.ad1 = land.brand.children[2];
		        land.brand.ad2 = land.brand.children[3];
		        land.brand.bar = land.brand.children[4];

		        land.brand.ad1.material = new THREE.MeshBasicMaterial({ map: brand_textures[brand_index] });
		        land.brand.ad2.material = new THREE.MeshBasicMaterial({ map: brand_textures[brand_index] });
		   
		        land.brand.position = land.max_area_mesh.position;
		        land.brand.position.y += 100;
		        land.buildings.add(land.brand);
		       

		        brand_index++;

		        brand_index = brand_index % brand_textures.length;
		       
		     
		    }else
    		    continue;
		}
		var children = land.buildings.children,
			child, c, cl, count;

		if (!land.startBuilding)  {
			for (c=0, cl=children.length, count = 0; c<cl; c++) {
				child = children[c];
				if (child.scale.y<1) {
					// child.scale.y += 0.01; //0.005
					child.scale.y += 0.0004 * delta; //0001
					//16.6  = 0.01
					// 30 = 0.2
				} else {
					child.scale.y = 1;
					child.matrixAutoUpdate = false;
					count++;
				}
			}

			if (cl && count == cl) {
				land.startBuilding = Date.now();
				land.context.clearRect(0, 0, width, height);
				land.landTexture.needsUpdate = true;
				// ground zero is built
				// if (l==0) {
				// 	var w = director._playingTime/1000;
				// }
			}
		} else {
			var startBuilding = land.startBuilding

			var lapsed = Date.now() - startBuilding;
			var totalTime = 4000;

			var k = lapsed / totalTime;

			// Quad in / out
			k = ( ( k *= 2 ) < 1 ) ? 0.5 * k * k : - 0.5 * ( --k * ( k - 2 ) - 1 );

			var meshes = land.buildings.children;
			var mesh = meshes[0];

			mesh.material.opacity = 0.2 + k * 0.8;


			var done = lapsed>totalTime;

			land.buildings.scale.y = 0.5 + k / 2;

			if (done) {
				land.buildings.matrixAutoUpdate = false;
				land.done = true;
			}
		}
	};

    //grow the center
	if (!theCenter_done) {
	    if (theCenter) {
	        if (theCenter.scale.y <= 1) {
	            theCenter.scale.y += theCenter_speed;
	        } else {
	            theCenter_done = true;
	        }
	    }
	}
	animateBirds();

	switch (cameraMode) {
		case 0:
			// lookAt.set(0,0,0);
			break;
		case 1:
			lookAt.use = true;
			boidCamera(delta);
			break;
		case 2:
			// Hawk's Camera
			lookAt.use = true;
		    camera.position.copy(boids[ 0 ].position);
			//camera.position.set(500,300,-300);
			lookAt.set(0,50,0);
			break;
		case 3:
			// FPS controls
			lookAt.use = false;
			controls.update(delta/1000);
			break;
		case 4:
			// Not in use. Orbit controls
			controls.update(delta/1000);
			break;
		case 5:
			// Tram Controls controls
			camera.setLens(24);
			lookAt.use = false;
			var d = timestamp % 20000;
			d /= 20000;
			var v = tramRoute.getPointAt(d);
			camera.position.set(v.x, 100, v.y);
			var v2 = tramRoute.getPointAt((d+0.1)%1);
			lookAt.set(v2.x, 100, v2.y);
			camera.lookAt(lookAt);

			// var targetXrotation = camera.rotation.x + moveY * Math.PI / 3;
			// var targetYrotation = camera.rotation.y - moveX * Math.PI;
			// camera.rotation.x += (targetXrotation - camera.rotation.x) * 0.1;
			// camera.rotation.y += (targetYrotation - camera.rotation.y) * 0.1;

			break;
		case 6:
			// Lookable around for Boid Cams
			lookAt.use = false;
			boidCamera(delta);
			if (delta && moveX) {
				steerX += moveX * (delta / 1000) * Math.PI;
				steerY += moveY * (delta / 1000) * Math.PI;
				camera.lookAt(lookAt)
				camera.rotation.z += steerX;
				camera.rotation.y += steerY;
			}

			break;
	}


	lookAt.use && camera.lookAt(lookAt);

	renderer.clear();
	
    renderer.render( scene, camera );

	SHOW_STATS && stats.update();

}

function boidCamera(delta) {

	var b = boids[ 0 ];

	targetCamera.copy(b.velocity).normalize().negate().multiplyScalar(20).addSelf(b.position);
	targetCamera.y += 50;

	camera.position.addSelf(targetCamera.subSelf(camera.position).multiplyScalar(0.02));
	lookAt.copy(b.position);
	lookAt.y += 15;

}


function animateBirds() {
	for ( var i = 0, il = birds.length; i < il; i++ ) {

		boid = boids[ i ];
		boid.run( boids );

		bird = birds[ i ];
		bird.rotation.y = Math.atan2( - boid.velocity.z, boid.velocity.x );
		bird.rotation.z = Math.asin( boid.velocity.y / boid.velocity.length() );
		bird.phase = ( bird.phase + ( Math.max( 0, bird.rotation.z ) + 0.1 )  ) % 62.83;
		bird.geometry.vertices[ 5 ].y = bird.geometry.vertices[ 4 ].y = sin( bird.phase ) * 5;
		bird.geometry.verticesNeedUpdate = true;

	}
}

var extrudeSettings = { amount: 20, bevelEnabled: false };
var extrudeSettings_base = { amount: 1, bevelEnabled: false };


var building_num = 0;
forget = 0;
function buildingFromFace(face, buildings, buildings_base, land, material, material_base) {
	// console.time('buildingFromFace');

	var vertices = [];

	var t;
	
	face.forEach(function(edge) {
		t = new THREE.Vector2().copy(edge.start);
		vertices.push(t);
	});

	var polyarea = area(vertices);
    
	var min_x=vertices[0].x;
	var max_x=vertices[0].x;
	var min_y=vertices[0].y;
	var max_y=vertices[0].y;
    ///
	if (vertices.length < 3 || vertices.length > 6) {
	    window.forget++;
	    return;
	}

	vertices.push(vertices[0]);

	var centroid = getCentroid(vertices, polyarea);


    ///忽略长宽比例过于不均衡的
	for (var i=0;i<vertices.length-1;i++) {
		var v = vertices[i];
		v.subSelf(centroid);
		if (v.x<min_x) {
		    min_x = v.x;
		} else if(v.x>max_x) {
		    max_x = v.x;
		}

		if (v.y < min_y) {
		    min_y = v.y;
		} else if(v.y>max_y) {
		    max_y = v.y;
		}
	}
	land.maxWHRadius = 3;
	if ((max_x - min_x)/(max_y-min_y)>=land.maxWHRadius ){
	    return;
	} else if ((max_y - min_y)/(max_x - min_x)  >= land.maxWHRadius) {
	    return;
	}

	
	var cubearea = (max_y - min_y) * (max_x - min_x);
	var shrink_index = polyarea / cubearea;

	if (polyarea < 200) {
		extrudeSettings.amount = 10;
		// cut off for very small areas
	} else if (polyarea < 600) {
		extrudeSettings.amount = 70 + random() * 150;
		// We make small areas tall skyscrappers
	} else if (polyarea < 2000) {
		extrudeSettings.amount = 60 + random() * 40;
	} else {
		extrudeSettings.amount = 10 + random() * 40;
		// very large areas
	}

	if (land.factor) {
		extrudeSettings.amount *= Math.pow(1/land.factor, 0.3);
	}

	if (extrudeSettings.amount<13) {
	    return;
	}
	var landShape = new THREE.Shape(vertices);
	

	var geometry = new THREE.ExtrudeGeometry( landShape, extrudeSettings );

    
	//var geometry = new THREE.CubeGeometry((max_x - min_x) * shrink_index, extrudeSettings.amount, (max_y - min_y) * shrink_index);

	geometry.applyMatrix( new THREE.Matrix4().makeRotationX(Math.PI/2));
	geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, extrudeSettings.amount , 0) );
    

	var scale = 0.75 * landWidth / width;
	geometry.applyMatrix( new THREE.Matrix4().makeScale( scale, scale, scale ) );

	var mesh = new THREE.Mesh(geometry, material);

	mesh.position.set((centroid.x / width - 0.5) * landWidth , 0, (centroid.y / height - 0.5) * landWidth );


	// mesh.visible = false;
	mesh.material.opacity = 0.5;
	mesh.scale.y = 0.0001;

	buildings.scale.y = 0.5;

	buildings.add(mesh);

	if (polyarea > land.max_area) {
	    land.max_area = polyarea;
	    land.max_area_mesh = mesh;

	    land.selected_mesh_index = land.building_index;

	} else if (polyarea < land.min_area) {
	    land.min_area = polyarea;
	    land.min_area_mesh = mesh;
	}

	var geometry = new THREE.ExtrudeGeometry(landShape, extrudeSettings_base);

	geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));
	geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, extrudeSettings_base.amount, 0));

	var scale = 0.9 * landWidth / width;
	geometry.applyMatrix(new THREE.Matrix4().makeScale(scale, scale, scale));

	var mesh = new THREE.Mesh(geometry, material_base);

	mesh.position.set((centroid.x / width - 0.5) * landWidth, 0, (centroid.y / height - 0.5) * landWidth);

	buildings_base.add(mesh);

    // console.timeEnd('buildingFromFace');

	building_num++;


	land.building_index++;
	

	
	
}


function roadsAreDone(land) {

	// Roads are completed, now build the buildings.
	var faces = detectFaces(land.all_roads);
	clearInterval(land.run);

	var width = land.canvas.width;
	var height = land.canvas.height;

	var buildings = land.buildings;
    //base
	var buildings_base = land.buildings_base;

	// doubleCheck();
	//var floorTexture = new THREE.ImageUtils.loadTexture('Assets/Images/images.jpg');

     var material = new THREE.MeshLambertMaterial( { color: 0xdddddd});
	
	var material_base = new THREE.MeshBasicMaterial({ color: 0x000000 });

	function callBack(face, buildings, land) {
		return function() {
		    buildingFromFace(face, buildings, buildings_base, land, material, material_base);
		};
	}

	var p = LESS_BUILDINGS ? 0.7 : 1;

	if (land != lands[0]) p -= 0.3; // reduce


	land.max_area = 0;
	land.min_area = 0;
	for (var f=0;f<faces.length;f++) {

		// Delay triangulation from 0 - 4s
	    if (random() < p) {
	        setTimeout(callBack(faces[f], buildings, land), random() * (CONSTRUCTION_DELAY));
	       
	    }
		

	}
	

}

function rebuildCities() {
	// Cancel all land timers
	// Cancel all building triangulation timers
	// Remove all cities
	// Deallocate all cities

	// LandObject -> Planes

	// Lands
	//  |- lands.buildings
    //  |- land.landTexture
  
	var a;
	while (a = landLease.pop()) {
		clearTimeout(a);
	}

	lands.forEach(function(l) {
		var buildings = l.buildings;
		var land = buildings.parent;

		l.landTexture.deallocate();
		buildings.children.forEach(function(mesh) {
			mesh.deallocate();
			mesh.geometry.deallocate();
			mesh.material.deallocate();
			renderer.deallocateObject( mesh );
		});

		renderer.deallocateTexture( l.landTexture );

		scene.remove(land);

	});

	// Create new lands
	var f = function(x, y) {
		return function() {
			addNewLand(x, y);
		};
	}
	
	for (var y=-many; y<=many; y++) {
		for (var x=-many; x<=many; x++) {
			landLease.push(setTimeout(f(x, y), 10000 * random()));
		}
	}
}
