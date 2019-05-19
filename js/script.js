//curves on globe
//https://medium.com/@xiaoyangzhao/drawing-curves-on-webgl-globe-using-three-js-and-d3-draft-7e782ffd7ab

const coords = [[ [47.3673, 8.55],[45.0703, 7.6869], ['Zurich - Paris'], [4]],
  [['47.3673', '8.55'], ['51.5081', '-0.128'], ['Zurich - Paris'],[1]],
  [['47.3673', '8.55'], ['41.3083', '-72.9279' ], ['Zurich - Paris'],[5]],
	[['47.3673', '8.55'], ['26.1224',  '-80.13731' ], ['Zurich - Fort Lauderdale'],[7]], //ch - florida
	[['47.3673', '8.55'], ['50.0755',  '14.4378' ], ['Zurich - Prague'],[4]], //ch - prag
	[['47.3673', '8.55'], ['26.1224',  '-80.13731' ],['Zurich - Paris'],[12]], //ch - florida
  [['47.3673', '8.55'],['41.3083', '-72.9279' ],['Zurich - Paris'],[20]], //ny -nh
  [['47.3673', '8.55'],['9.010', '38.761' ],['Zurich - Paris'],[4]], //addis -ch
  [['47.3673', '8.55'],['13.754', '100.493' ],['Zurich - Paris'],[5]], //ch bankok
  [['47.3673', '8.55'],['14.693', '-17.447' ],['Zurich - Paris'],[30]], //ch - dakar
  [['47.3673', '8.55'],['37.779', '-122.418' ],['Zurich - Paris'],[5]], //ch - sf
  [['47.3673', '8.55'],['-54.806', '-68.307' ],['Zurich - Ushuaia'],[1]], //ch - ushuaia
  [['47.3673', '8.55'],['41.009', '28.965' ],['Zurich - Instanbul'],[12]] //ch - istanbul
  ];

const CHcoords = ['47.3673', '8.55'];

//const GLOBE_RADIUS = 0.5;
var controls, counter=0;

const CURVE_SEGMENTS = 32;
const CURVE_MIN_ALTITUDE = 20;
const CURVE_MAX_ALTITUDE = 200;

var loader = new THREE.FileLoader();
var objectLoader = new THREE.ObjectLoader();
var jsonLoader = new THREE.JSONLoader();

var radius = 6371;
var radius1 = 0.5;
const altitude = 0.3;

var tangent = new THREE.Vector3();
var axis = new THREE.Vector3();
var up = new THREE.Vector3(0, 1, 0);
var raycaster = new THREE.Raycaster();
raycaster.linePrecision = 2;
var mouse = new THREE.Vector2(), INTERSECTED;

var lightHolder = new THREE.Group();

var remappedScale = d3.scaleLinear().range([2, 30])
remappedScale.domain([0.9, 6457]);
console.log("remapped scale", remappedScale(3000));

    var onRenderFcts= [];
    var scene = new THREE.Scene();

    var geometry   = new THREE.SphereGeometry(radius1, 50, 50)
  // var material  = new THREE.MeshPhongMaterial({
  //  map: texture})
   var elmt = document.getElementById("earth");

   //console.log('windowwidth',window.innerWidth, 'windowheight', window.innerHeight)
   //console.log(elmt,'elementwidth',elmt.clientWidth, 'elementheight', elmt.clientHeight,'element divided', elmt.clientWidth / elmt.clientHeight)

    var material  = new THREE.MeshStandardMaterial()
    var camera  = new THREE.PerspectiveCamera(45, elmt.clientWidth / window.innerHeight, 0.01, 1000 );
    var canvas = document.getElementById("custom");

  
    var renderer  = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
    //renderer.setSize( elmt.clientWidth, window.innerHeight );

    //renderer.setSize( canvas.width, canvas.height );
    //renderer.setViewport( elmt.clientWidth, window.innerHeight );


    var earthMesh = new THREE.Mesh(geometry, material)
    //var controls = new THREE.OrbitControls(scene);
    //var controls = new THREE.OrbitControls(camera, renderer.domElement);

    function createTube(coordPair){
      //console.log("selected cords", coordPair);
      const interpolate = d3.geoInterpolate(coordPair[0], coordPair[1]);
      const midCoord1 = interpolate(0.5);
      const midCoord2 = interpolate(0.75);

      //console.log("interpolate", interpolate, midCoord1);

      var curve = new THREE.QuadraticBezierCurve3(
        converttoCartesian2(radius1, coordPair[0]),
        converttoCartesian2(radius1 + altitude, midCoord1),
        converttoCartesian2(radius1, coordPair[1])
      );

      return curve;
    }

    var sphere = new THREE.SphereGeometry(0.005, 32, 32);
    var object = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({
        color: 0xff0000
    }));

    object.name = "sphere";


    var meshArray = [];
    var objectArray = [];


  //   var sphere = new THREE.SphereGeometry(0.005, 32, 32);
  //   var object = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({
  //       color: 0xff0000
  //   }));

  //   object.name = "sphere";


  //   var meshArray = [];
  //   var objectArray = [];

  //   for (let i=0;i<coords.length;i++){
      
  //     var tube = new THREE.TubeGeometry(createTube(coords[i]), 30, (coords[i][3])*0.0001, 50, false);
  //     var mesh = new THREE.Mesh(tube, new THREE.MeshBasicMaterial({
  //           color: 0xff0000
  //     }));
      
  //     mesh.name = coords[i][2];
  //     mesh.userData.amount = coords[i][3];
  //     meshArray.push(mesh);
  //     objectArray.push(object.clone());
  // }


    //console.log("object", objectArray);


//-----------the curve-----------

$("#fromto").on("click", function() {
  //var el = $("#fromto");
  var el = document.getElementById("fromto").innerHTML;
  console.log("ell", el);
  if (el == "from") {
    document.getElementById("fromto").innerHTML = "to";
  } else {
    document.getElementById("fromto").innerHTML = "from";
  }

  addGlobe();
});
 
  

$(document).ready(function() {


  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.autoRotate = false;
  controls.autoRotateSpeed = -1.0;
  controls.enablePan = false;
  controls.enableZoom = false;
  //makes the sphere rotate "smoother"
  controls.enableDamping = true;
  controls.dampingFactor = 0.15;
  
  
  camera.position.z = 2;
  scene.background = new THREE.Color( 0x98FB98 );
  var ambientLight = new THREE.AmbientLight(0x888888);
  //var light1  = new THREE.DirectionalLight( 0xcccccc, 1 );
  var pointLight = new THREE.PointLight(0xffffff, 3, 60); //intensity & distance
  pointLight.position.set(5, 5, 5);
  lightHolder.add(pointLight);
  scene.add(lightHolder);
  scene.add(ambientLight);

   material.map   = new THREE.TextureLoader().load('textures/earth.jpg')
  material.bumpMap    = new THREE.TextureLoader().load('textures/earth-bump.jpg')
  material.bumpScale = 0.01
  material.anisotropy = renderer.capabilities.getMaxAnisotropy();
  //lightHolder.quaternion.copy(camera.quaternion);

  //camera.add(light)
  //camera.add(light1)

  //camera.add( light )
  //var axisHelper = new THREE.AxesHelper( 5 );
  //scene.add( axisHelper );
  //The X axis is red. The Y axis is green. The Z axis is blue.
  var axesHelper = new THREE.AxesHelper( 5 );
  scene.add( axesHelper );

  document.addEventListener( 'mousemove', onMouse, false );
  elmt.appendChild( renderer.domElement );

  addGlobe();




  //animate();

    //----this is where the magic happens-------
  //setInterval(moveObj, 50);});
})

function addGlobe() {

  d3.json("data/tradeflows.json", function(error, data) {
    console.log("load data", [data[0].Latitude, data[0].Longitude], CHcoords); 

    for (let i=0;i<coords.length;i++){
      console.log("load data", coords[i]); 
      
      var tube = new THREE.TubeGeometry(createTube(coords[i]), 30, (coords[i][3])*0.0001, 50, false);
      var mesh = new THREE.Mesh(tube, new THREE.MeshBasicMaterial({
            color: 0xff0000
      }));
      
      mesh.name = coords[i][2];
      mesh.userData.amount = coords[i][3];
      meshArray.push(mesh);
      objectArray.push(object.clone());
  }




  for (let i=0;i<coords.length;i++){
      earthMesh.add(meshArray[i]);
      earthMesh.add(objectArray[i]);
  }
 

  scene.add(earthMesh);
  animate(); //execute animate only once data is loaded!

  });

 
}

function onMouse(event) {
  mouse.x = ( event.clientX / elmt.clientWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}


//----------NEW functions---------
function animate() {
    //onWindowResize();

    resizeCanvasToDisplaySize();
    
    console.log("objectarray", objectArray);

     if (counter <= 1) {
        for (var i=0; i<coords.length; i++){

        objectArray[i].position.copy(createTube(coords[i]).getPointAt(counter) );
        //objectArray[1].position.copy(createTube(coords[5]).getPointAt(counter) );
        //console.log("position of object should be changed", objectArray[0].position, counter)
        }

        counter += 0.005
      } else {
        counter = 0;
      }
    //}
    requestAnimationFrame(animate);
    render();
}

function render() {
    controls.update();
    raycaster.setFromCamera( mouse, camera );

    // calculate objects intersecting the picking ray
    var intersects = raycaster.intersectObjects( earthMesh.children );

    //console.log("what's intersecting", INTERSECTED);

    if (intersects.length > 0){
    if (INTERSECTED != intersects[0] ){

      if (INTERSECTED){
        INTERSECTED.object.material.color.set(0xff0000);
        document.getElementsByClassName("row-info").innerHTML = INTERSECTED.object.name;
        //document.getElementById("amount").innerHTML = INTERSECTED.object.userData.amount;
      }
      INTERSECTED = intersects[ 0 ];
      //console.log("INTERSECTED 1", INTERSECTED);
      INTERSECTED.object.material.color.set(0xFF9090);

    } else {
       INTERSECTED.object.material.color.set(0xFF9090);
    }
    }

    // for ( var i = 0; i < intersects.length; i++ ) {

    //   intersects[i].object.material.color.set( 0x00BFFF );

    // }
    //renderer.setSize( window.innerWidth, window.innerHeight );
    lightHolder.quaternion.copy(camera.quaternion);
    renderer.render(scene, camera);
}


function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        //renderer.setSize( 200, 200 );
        renderer.setSize( elmt.clientWidth, window.innerHeight, false );
        renderer.setViewport( elmt.clientWidth, window.innerHeight );
        //renderer.setSize( window.innerWidth, window.innerHeight );
      }

function resizeCanvasToDisplaySize() {
  //console.log("canvas", canvas);
  const width = canvas.clientWidth;
  //const height = canvas.clientHeight;
  const height = window.innerHeight;
  //console.log("canvas width and height", width, height);
  if (canvas.width !== width ||canvas.height !== height) {
    // you must pass false here or three.js sadly fights the browser
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    // set render target sizes here
  }
}



function convertoRad(deg){
	const rad = (Math.PI / 180) * deg;
	return rad;
}


//https://rbrundritt.wordpress.com/2008/10/14/conversion-between-spherical-and-cartesian-coordinates-systems/
//Three: The X axis is red. The Y axis is green. The Z axis is blue.
function converttoCartesian2(R, coord1){
  var y = R *Math.sin(convertoRad(coord1[0])); //lat degree
  var rProj = R * Math.cos(convertoRad(coord1[0]));
  var z = -(rProj * Math.sin(convertoRad(coord1[1])));
  var x = rProj * Math.sin(convertoRad(90-coord1[1]));
  
  return new THREE.Vector3(x,y,z);

}

//console.log("converted2", converttoCartesian2(radius1, coord1));


//-----------------make spline---------------
var createCurvePath = function(start, end, elevation) {
    var start3 = globe.translateCordsToPoint(start.latitude, start.longitude);
    var end3 = globe.translateCordsToPoint(end.latitude, end.longitude);
    var mid = (new LatLon(start.latitude, start.longitude)).midpointTo(new LatLon(end.latitude, end.longitude));
    var middle3 = globe.translateCordsToPoint(mid.lat(), mid.lon(), elevation);

    var curveQuad = new THREE.QuadraticBezierCurve3(start3, middle3, end3);
    //   var curveCubic = new THREE.CubicBezierCurve3(start3, start3_control, end3_control, end3);

    var cp = new THREE.CurvePath();
    cp.add(curveQuad);
    //   cp.add(curveCubic);
    return cp;
}
