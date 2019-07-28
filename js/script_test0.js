var container, camera, renderer, scene, directionalLight, fillLight, raycaster, mouse;
var WIDTH = window.innerWidth - 30;
var HEIGHT = window.innerHeight - 30;
            
// camera
var angle = 45;
var aspect = WIDTH / HEIGHT;
var near = 0.1;
var far = 10000;

// objects
var cube;
var sphere;

setupScene();
addObjects();
animate();

function setupScene(){

    container = document.createElement('div');
    document.body.appendChild(container);
                
    camera = new THREE.PerspectiveCamera(angle, aspect, near, far);
    camera.position.set(0, 0, 5);
                
    scene = new THREE.Scene();
    camera.lookAt(scene.position);

    fillLight = new THREE.HemisphereLight( 0xffffff, 0x0ffffff, 1 ); 
    scene.add(fillLight);

    renderer = new THREE.WebGLRenderer({antialias : true});
    renderer.setClearColor(0xffffff, 1);
    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    document.addEventListener('mousedown', onDocumentMouseDown, false);
}

function addObjects(){

    var geometry = new THREE.SphereGeometry(1, 16, 8);
    var material = new THREE.MeshLambertMaterial({color: 0xaa0044});
    sphere = new THREE.Mesh(geometry, material);

    // test rotation by offsetting to 45 deg Y
    // sphere.rotateOnAxis(new THREE.Vector3(0, 1, 0), 45 * Math.PI / 180);
    scene.add(sphere);

    addAxisHelper(sphere, 200);
    addWireframeHelper(sphere, 0xffffff, 1);
}

function addWireframeHelper(mesh, color, width){
    var helper = new THREE.WireframeHelper(mesh, color);
    helper.material.linewidth = width;
    scene.add(helper);
}

function addAxisHelper(target, size){
    var helper = new THREE.AxisHelper(size);
    target.add(helper);
}

function onDocumentMouseDown(event){
    mouse.x = ( event.clientX / renderer.domElement.width ) * 2 - 1;
    mouse.y = - ( event.clientY / renderer.domElement.height ) * 2 + 1;

    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects([sphere], false );

    if (intersects.length > 0) {
        var point = intersects[0].point;
        console.log("point", point);
        
        var a = new THREE.Vector3(0,0,1);
        var b = point.normalize();
        console.log("point normalized", b);
        
        var rotationAxis = new THREE.Vector3(0, 0, 0);
        rotationAxis.crossVectors(b, a);
        var dot = a.dot(b);
        var angle = Math.acos(dot);
        
        var quaternion = new THREE.Quaternion();
        var dest = quaternion.setFromAxisAngle(rotationAxis, angle);
        sphere.setRotationFromQuaternion(dest);
    }
}

function animate(){
    requestAnimationFrame(animate);

    render();       
}

function render(){
    renderer.clear();
    renderer.render(scene, camera);
}