//curves on globe
//https://medium.com/@xiaoyangzhao/drawing-curves-on-webgl-globe-using-three-js-and-d3-draft-7e782ffd7ab
const allDonors = ['Japan', 'Germany', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Italy', 'Belgium', 'Sweden', 'France', 'Netherlands', 'Norway', 'Switzerland', 'Kuwait', 'United Arab Emirates', 'Denmark', 'Saudi Arabia', 'Austria', 'Spain', 'Finland', 'Korea'];
//const GLOBE_RADIUS = 0.5;
var controls, counter = 0;
const tubeSegments = 50;
const CURVE_MIN_ALTITUDE = 0.05;
const CURVE_MAX_ALTITUDE = 0.5;
var loader = new THREE.FileLoader();
var objectLoader = new THREE.ObjectLoader();
var jsonLoader = new THREE.JSONLoader();
var radius1 = 0.6;
const altitude = 0.4;
var animIsRunning = true;
var tangent = new THREE.Vector3();
var axis = new THREE.Vector3();
var up = new THREE.Vector3(0, 1, 0);
var raycaster = new THREE.Raycaster();
raycaster.linePrecision = 50;
raycaster.far = 2;
var mouse = new THREE.Vector2(),
    INTERSECTED;
var lightHolder = new THREE.Group();
var remappedScale = d3.scaleLinear().range([0.002, 0.006]);
remappedScale.domain([0.1, 3.85]);
//console.log("remapped scale", remappedScale(3));
var onRenderFcts = [];
var scene = new THREE.Scene();
var geometry = new THREE.SphereGeometry(radius1, 50, 50);
// var material  = new THREE.MeshPhongMaterial({
//  map: texture})
var elmt = document.getElementById("earth");
//console.log('windowwidth',window.innerWidth, 'windowheight', window.innerHeight)
//console.log(elmt,'elementwidth',elmt.clientWidth, 'elementheight', elmt.clientHeight,'element divided', elmt.clientWidth / elmt.clientHeight)
var material = new THREE.MeshStandardMaterial();
var camera = new THREE.PerspectiveCamera(45, elmt.clientWidth / window.innerHeight, 0.1, 1000);
var canvas = document.getElementById("custom");
var renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvas
});
//renderer.setSize( elmt.clientWidth, window.innerHeight );
//renderer.setSize( canvas.width, canvas.height );
//renderer.setViewport( elmt.clientWidth, window.innerHeight );
var earthMesh = new THREE.Mesh(geometry, material);
//var controls = new THREE.OrbitControls(scene);
//var controls = new THREE.OrbitControls(camera, renderer.domElement);
var sphere = new THREE.SphereGeometry(0.005, 32, 32);
var object = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({
    color: 0xff0000
}));
//object.name = "sphere";
var meshArray = [];
var objectArray = [];
var anim;
var tooltipEnabledObjects = [];
//-----------update on click-----------
$("#countries-input").on("change", function(e) {
    var value = document.getElementById('countries-input').value;
    addGlobe(value);
});
$(document).ready(function() {
    populateDatalist(allDonors);
    //console.log("this is a loading manager", manager);
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.autoRotate = false;
    controls.autoRotateSpeed = -1.0;
    controls.enablePan = false;
    controls.enableZoom = false;
    //makes the sphere rotate "smoother"
    controls.enableDamping = true;
    controls.dampingFactor = 0.15;
    camera.position.z = 2;
    scene.background = new THREE.Color(0x98FB98);
    var ambientLight = new THREE.AmbientLight(0x888888);
    //var light1  = new THREE.DirectionalLight( 0xcccccc, 1 );
    var pointLight = new THREE.PointLight(0xffffff, 3, 60); //intensity & distance
    pointLight.position.set(5, 5, 5);
    lightHolder.add(pointLight);
    scene.add(lightHolder);
    scene.add(ambientLight);
    var loaders = {
        map: new THREE.TextureLoader().load('textures/earth.jpg'),
        bumpMap: new THREE.TextureLoader().load('textures/earth-bump.jpg')
    };
    // material.map   = new THREE.TextureLoader().load('textures/earth.jpg')
    // material.bumpMap    = new THREE.TextureLoader().load('textures/earth-bump.jpg')
    material.map = loaders.map;
    material.bumpMap = loaders.bumpMap;
    material.bumpScale = 0.01;
    material.anisotropy = renderer.capabilities.getMaxAnisotropy();
    material.transparent = true;
    //fogColor = new THREE.Color(0xf6f062);
    //scene.fog = new THREE.Fog(fogColor, 0.0025, 20);
    material.opacity = 1;
    //lightHolder.quaternion.copy(camera.quaternion);
    earthMesh.rotation.y = Math.PI * 1.5;
    //camera.add(light)
    //camera.add(light1)
    //camera.add( light )
    //var axisHelper = new THREE.AxesHelper( 5 );
    //scene.add( axisHelper );
    //The X axis is red. The Y axis is green. The Z axis is blue.
    var axesHelper = new THREE.AxesHelper(5);
    //scene.add( axesHelper );
    document.addEventListener('mousemove', onMouse, false);
    //console.log("onMouse", onMouse);
    elmt.appendChild(renderer.domElement);
    addGlobe("Germany");
});

function addGlobe(country) {
    //$("#loading-screen").hide();
    var el = document.getElementById("selector");
    //if country is a country in list then change title, else do nothing
    el.innerHTML = "Aid money from " + country;
    //remove all children
    earthMesh.children = [];
    //var lineGeometry = new THREE.Geometry();
    //var lineMat = new THREE.LineBasicMaterial( { color: '#fcba03', linewidth: 1 } );
    //var mesh, movingGlobe;
    var mesh, movingGlobe;
    var lineMat = new THREE.LineBasicMaterial({
        color: '#fff',
        linewidth: 6
    });
    //earthMesh.rotation.set(new THREE.Vector3( 0, 0, Math.PI / 2));
    d3.json("data/aiddata.json", function(error, data) {
        //earthMesh.rotation.y = Math.random();
        // var mesh, movingGlobe;
        // var lineGeometry = new THREE.Geometry();
        // var lineMat = new THREE.LineBasicMaterial( { color: '#fcba03', linewidth: 1 } );
        console.log("reload data for", country);
        if (error) throw error;
        for (let i = 0; i < data.length; i++) {
            if (data[i].Donor == country) {
                //earthMesh.rotation.set(converttoCartesian2(radius1, [data[i].lat_donor, data[i].lon_donor]));
                //console.log("data was loaded and contains", country);
                //lat,long donor / lat,long recip
                var array = [
                    [data[i].lat_donor,
                        data[i].lon_donor
                    ],
                    [data[i].lat_recip,
                        data[i].lon_recip
                    ]
                ];
                //console.log("recip", data[i].lat_recip, data[i].lon_recip,"donor", data[i].lat_donor, data[i].lon_donor);
                //console.log("convert to cart", converttoCartesian2(radius1, array[0]).y,Math.PI / 2);
                //rotate earth to correct position:
                //https://stackoverflow.com/questions/34267181/rotating-a-sphere-so-that-clicked-point-is-vector-toward-the-camera?noredirect=1&lq=1
                //earthMesh.rotation.y = converttoCartesian2(radius1, array[0]).y;
                var tube = new THREE.TubeGeometry(createTube(array), tubeSegments, remappedScale(data[i].Amount), 50, false);
                //console.log(data[i]);
                //var tube = new THREE.TubeGeometry(createTube(coords[i]), 30, (coords[i][3])*0.0001, 50, false);
                mesh = new THREE.Mesh(tube, new THREE.MeshBasicMaterial({
                    color: 0xff0000,
                    blending: THREE.AdditiveBlending,
                    opacity: 0.9,
                    transparent: true,
                }));
                controls.update();
                mesh.name = "Aid money from " + data[i].Donor + " to " + data[i].Recipient;
                mesh.userData.amount = data[i].Amount;
                meshArray.push(mesh);
                movingGlobe = object.clone();
                movingGlobe.name = "Aid money from " + data[i].Donor + " to " + data[i].Recipient;
                movingGlobe.userData = array;
                movingGlobe.userData.amount = data[i].Amount;
                objectArray.push(movingGlobe);
                //console.log("mesh", mesh, "mesh i", meshArray[i], "full array", meshArray)
                //console.log(e);
                earthMesh.add(mesh);
                //earthMesh.add(line);
                earthMesh.add(movingGlobe);
                //console.log("mesh", mesh);
            }
            //------------------add lines & labels---------------------------
            var lineGeometry = new THREE.Geometry();
            lineGeometry.vertices.push(converttoCartesian2(radius1,
                [data[i].lat_donor,
                    data[i].lon_donor
                ]));
            lineGeometry.vertices.push(converttoCartesian2(radius1 + 0.06, [
                data[i].lat_donor,
                data[i].lon_donor
            ]));
            var line = new THREE.Line(lineGeometry, lineMat);
            //scene.add(line); 
        }
        //console.log("linegeom", lineGeometry, "line", line);
        scene.add(earthMesh);
        //this prevents the anim from running over and over again
        if (animIsRunning) {
            animate(); //execute animate only once data is loaded!
            setTimeout(function() {
                const loadingScreen = document.getElementById('loading-screen');
                //loadingScreen.style.display = 'inline-block';
                //console.log("repeat loader");
                //loadingScreen.classList.add( 'fade-out' );
                $('#loading-screen').fadeOut(1500);
                //loadingScreen.style.zIndex = "-1";
                $('#test0').fadeIn("slow");
                //loadingScreen.style.width = "0";
                //loadingScreen.style.height = "0";
            }, 3500);
        }
        animIsRunning = false;
    });
}

function createTube(coordPair) {
    //console.log("selected cords", coordPair[0][0]);
    //two-element array [longitude, latitude]
    const interpolate = d3.geoInterpolate([coordPair[0][
        1
    ], coordPair[0][0]], [coordPair[1][1],
        coordPair[1][0]
    ]);
    const midCoord0 = interpolate(0.5);
    const midCoord1 = interpolate(0.25);
    const midCoord2 = interpolate(0.75);
    //console.log("interpolated coords", midCoord1, midCoord2);
    function clamp(num, min, max) {
        //if distance start-end is smaller than min
        return num <= min ? min : (num >= max ? max : num);
    }
    var start = converttoCartesian2(radius1, coordPair[0]);
    var end = converttoCartesian2(radius1, coordPair[1]);
    const altitude2 = clamp(start.distanceTo(end) * .4, CURVE_MIN_ALTITUDE, CURVE_MAX_ALTITUDE);
    //console.log("altitude", altitude2);
    var mid1 = converttoCartesian2(radius1 + altitude2, [
        midCoord1[1], midCoord1[0]
    ]);
    var mid2 = converttoCartesian2(radius1 + altitude2, [
        midCoord2[1], midCoord2[0]
    ]);
    var curve = new THREE.CubicBezierCurve3(start, mid1, mid2, end);
    //console.log("this is the start of the curve", start);
    return curve;
}

function onMouse(event) {
    //update position of mouse vector as defined in the beginning
    mouse.x = (event.clientX / elmt.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
//----------NEW functions---------
function animate(d) {
    //onWindowResize();
    //console.log("why not defined", d);
    resizeCanvasToDisplaySize();
    anim = cancelAnimationFrame(animate);
    //console.log("objectarray", objectArray);
    if (counter <= 1) {
        //console.log("counter", counter);
        for (var i = 0; i < objectArray.length; i++) {
            objectArray[i].position.copy(createTube(objectArray[i].userData).getPointAt(counter));
            //objectArray[1].position.copy(createTube(coords[5]).getPointAt(counter) );
            //console.log("position of object should be changed", objectArray[0].position, counter)
        }
        counter += 0.005;
    } else {
        counter = 0;
    }
    anim = requestAnimationFrame(animate);
    render();
}

function render() {
    controls.update();
    raycaster.setFromCamera(mouse, camera);
    //console.log("what is mouse", mouse);
    //console.log("intersects");
    $('html,body').css('cursor', 'default');
    onTubeHover();
    lightHolder.quaternion.copy(camera.quaternion);
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    //renderer.setSize( 200, 200 );
    renderer.setSize(elmt.clientWidth, window.innerHeight, false);
    renderer.setViewport(elmt.clientWidth, window.innerHeight);
    //renderer.setSize( window.innerWidth, window.innerHeight );
}

function resizeCanvasToDisplaySize() {
    //console.log("canvas", canvas);
    const width = canvas.clientWidth;
    //const height = canvas.clientHeight;
    const height = window.innerHeight;
    //console.log("canvas width and height", width, height);
    if (canvas.width !== width || canvas.height !== height) {
        // you must pass false here or three.js sadly fights the browser
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        // set render target sizes here
    }
}

function convertoRad(deg) {
    const rad = (Math.PI / 180) * deg;
    return rad;
}
//https://rbrundritt.wordpress.com/2008/10/14/conversion-between-spherical-and-cartesian-coordinates-systems/
//Three: The X axis is red. The Y axis is green. The Z axis is blue.
function converttoCartesian2(R, coord1) {
    var y = R * Math.sin(convertoRad(coord1[0])); //lat degree
    var rProj = R * Math.cos(convertoRad(coord1[0]));
    var z = -(rProj * Math.sin(convertoRad(coord1[1])));
    var x = rProj * Math.sin(convertoRad(90 - coord1[1]));
    return new THREE.Vector3(x, y, z);
}

function populateDatalist(array) {
    var options = '';
    array.forEach(function(i) {
        options += '<option value="' + i + '" />';
    });
    var dataList = document.getElementById('huge_list');
    dataList.innerHTML = options;
}

function showTooltip(a, b) {
    var divElement = $("#tooltip");
    console.log("show tt");
    //console.log("intersects in showtooltip()",a);
    if (divElement) {
        divElement.css({
            display: "block",
            opacity: 1.0
        });
        var canvasHalfWidth = renderer.domElement.offsetWidth / 2;
        var canvasHalfHeight = renderer.domElement.offsetHeight / 2;
        var tooltipPosition = a.clone().project(camera);
        tooltipPosition.x = (tooltipPosition.x * canvasHalfWidth) + canvasHalfWidth + renderer.domElement.offsetLeft;
        tooltipPosition.y = -(tooltipPosition.y * canvasHalfHeight) + canvasHalfHeight + renderer.domElement.offsetTop;
        var tootipWidth = divElement[0].offsetWidth;
        var tootipHeight = divElement[0].offsetHeight;
        divElement.css({
            left: `${tooltipPosition.x - tootipWidth/2}px`,
            top: `${tooltipPosition.y - tootipHeight - 5}px`
        });
        console.log("amount", b.userData.amount);
        divElement.text("Aid amount: $" + b.userData.amount);
    }
}

function hideTooltip() {
    var divElement = $("#tooltip");
    console.log("hide tt");
    if (divElement) {
        divElement.css({
            display: "none"
        });
    }
}

function onTubeHover() {
    // calculate objects intersecting the picking ray
    var intersects = raycaster.intersectObjects(earthMesh.children);
    if (intersects.length > 0) {
        if (INTERSECTED != intersects[0]) {
            //below is true when mouse hovers line
            if (INTERSECTED) {
                INTERSECTED.object.material.color.set(0xff0000);
                console.log("mouse over line", INTERSECTED, mouse);
                $('html,body').css('cursor', 'pointer');
                showTooltip(intersects[0].point, intersects[0].object);
                //console.log("what's intersecting", INTERSECTED);
                //document.addEventListener( 'mousemove', onMouse, false );
                document.getElementById("selector").innerHTML = INTERSECTED.object.name;
                //document.getElementById("amount").innerHTML = INTERSECTED.object.userData.amount;
            }
            console.log("after mouse over line?");
            INTERSECTED = intersects[0];
            //make item lightly colored
            //document.addEventListener( 'mousemove', onMouse);
            INTERSECTED.object.material.color.set(0xff4c4c);
            //hideTooltip();
        }
    } else {
        //$('html,body').css('cursor', 'pointer');
        if (INTERSECTED) {
            INTERSECTED.object.material.color.set(0xff0000);
            hideTooltip();
        }
    }
}