import * as Three from 'three';
import star from '../img/stars.jpg';
import nebula from '../img/nebula.jpg';
//Orbit controls allow the camera to orbit around a target.
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

import * as dat from 'dat.gui'; // graphical interface for changing variables in JS

// setup: set the stage
const renderer = new Three.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// setup: set the scene and camera
const scene = new Three.Scene();
const camera = new Three.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const orbit = new OrbitControls( camera, renderer.domElement ); // orbits controls -> to orbits the camera

// --- optional: set background color ---
//renderer.setClearColor(0x6ee6c9); // Change the background color

const textureLoader = new Three.TextureLoader(); 
//scene.background = textureLoader.load(star); // used image as background

const cubeTextureLoader = new Three.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
    nebula,
    nebula,
    star,
    star,
    star,
    star
]); // create a 3D cube backgroud with six sides

// set shadow - allow object to have shadow
renderer.shadowMap.enabled = true

// add an object to the screen
const axesHelper = new Three.AxesHelper(3); // a build in axes drawing
scene.add(axesHelper); // .add is used to add item to scene

// x = left & right / width / horizontal movement
// y = top & botton / height/ vertical movement
// z = zoom in or out / depth
camera.position.set(1,2,8); // set the camera position x,y,z
orbit.update(); // call the update method everytime the position of the camera is change. this only apply if we want OrbitControl


const geometry = new Three.BoxGeometry(); // add another build in object --> a cube
const material = new Three.MeshBasicMaterial( { color: 0x00FF00 } );
const cube = new Three.Mesh( geometry, material );
scene.add( cube );

const box2geometry = new Three.BoxGeometry(); // add another cube to scene 
const box2material = new Three.MeshBasicMaterial( { 
    // color: 0x00FF00,
    //map: textureLoader.load(nebula) // how to used image as object skin. 1) define a textureLoader variable 2) used textureLoader.load(image_name)
 } );
 //const box2 = new Three.Mesh( box2geometry, box2material );
 
const box2MultiMaterial = [
    new Three.MeshBasicMaterial({map: textureLoader.load(star)}),
    new Three.MeshBasicMaterial({map: textureLoader.load(star)}),
    new Three.MeshBasicMaterial({map: textureLoader.load(nebula)}),
    new Three.MeshBasicMaterial({map: textureLoader.load(star)}),
    new Three.MeshBasicMaterial({map: textureLoader.load(nebula)}),
    new Three.MeshBasicMaterial({map: textureLoader.load(nebula)})
] // to have different image for each side of the cube
const box2 = new Three.Mesh( box2geometry, box2MultiMaterial );
scene.add( box2 );
box2.position.set(1,1,1);
//box2.material.map = textureLoader.load(nebula); // we can update any property late by updating its material.map property



const geometry_2 = new Three.PlaneGeometry(5,5); // add another object --> plane
const material_2 = new Three.MeshStandardMaterial( {color: 0xFFFFFF, side: Three.DoubleSide} );
const plane = new Three.Mesh( geometry_2, material_2 );
scene.add( plane );
// to make the plane and the grid match
plane.rotation.x = -0.5 * Math.PI;
// Optional: add shadow to the plane
plane.receiveShadow = true;


const gridHelper = new Three.GridHelper(5)
scene.add(gridHelper)

const sphereGeometry = new Three.SphereGeometry(); // add a sphere object
const sphereMaterial = new Three.MeshBasicMaterial( { color: 0xffff00,
wireframe: false } ); 
const sphere = new Three.Mesh( sphereGeometry, sphereMaterial ); 
scene.add( sphere );
// Optional: add shadow to the sphere
sphere.castShadow = true;

// we can keep the default position at the center or change the object position
// sphere.position.z = 3;
sphere.position.set(-1,1,1);

// ----- lighting ----
// 1: ambient light
const ambientLight = new Three.AmbientLight(0x333333); 
scene.add(ambientLight);

// 2: directional light
// const directionalLight = new Three.DirectionalLight(0xFFFFFF, 0.8);
// scene.add(directionalLight);
// directionalLight.position.set(-10, 10, 0);
// directionalLight.castShadow = true;
// // directionalLight.shadow.camera.cotton = -5 // adject the light shadow

// const dlightHelper = new Three.DirectionalLightHelper(directionalLight, 2); // create a square that show the direction of the light
// scene.add(dlightHelper);


// const dlightShadowHelper = new Three.CameraHelper(directionalLight.shadow.camera);  // to see where the light is casting shadow
// scene.add(dlightShadowHelper);

// 3: spot light
const spotLight = new Three.SpotLight(0xffffff);
scene.add(spotLight);

const spotLightHelper = new Three.SpotLightHelper(spotLight);
scene.add(spotLightHelper);
spotLight.position.set(-1,5,0); // set light position
spotLight.castShadow = true; 
// spotLight.angle = 0.2;

scene.fog = new Three.FogExp2(0xFFFFFF, 0.01); // optional: create a fog on the scene mean the visible will be hard to see as you zoom out

// use dat.gui to allow using to interaction 
const gui = new dat.GUI(); // create a GUI



const options = {
    sphereColor: '#ffea00',
    wireframe: false,
    speed: 0.01,
    angle: 0.2,
    penumbra: 0,
    intensity: 1
}

gui.addColor(options, 'sphereColor').onChange((e) => {
    sphere.material.color.set(e)
})


gui.add(options, 'wireframe').onChange((e) => {
    sphere.material.wireframe = e;
})

gui.add(options, 'speed', 0, 0.1);

gui.add(options, 'angle', 0,1);
gui.add(options, 'penumbra',0,1);
gui.add(options,'intensity',0,1);


let step = 0;

// --- Selecting objects from the scene
const mousePosition = new Three.Vector2();

window.addEventListener('mousemove', (e) => {
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = - (e.clientY / window.innerHeight) * 2 + 1;
});

const rayCaster = new Three.Raycaster();

const sphereId = sphere.id; // sphere ID
box2.name = 'theBox'; // optional name for an object

function animate(time) {
	//requestAnimationFrame( animate );

	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;

    step += options.speed;
    sphere.position.y = 1.5 * Math.abs(Math.sin(step));

    spotLight.angle = options.angle;
    spotLight.penumbra = options.penumbra;
    spotLight.intensity = options.intensity;
    spotLightHelper.update();

    // selecting  object continue
    rayCaster.setFromCamera(mousePosition, camera);
    const intersects = rayCaster.intersectObjects(scene.children);

    for(let i = 0; i < intersects.length; i++){
        if(intersects[i].object.id === sphereId) // when the select object matches the Sphere ID change the material color
            intersects[i].object.material.color.set(0xff004b);
        
        if(intersects[i].object.name === 'theBox'){
            intersects[i].object.rotation.x = time / 1000;
            intersects[i].object.rotation.y = time / 1000;
        }
    }

	renderer.render( scene, camera );
}

renderer.setAnimationLoop(animate);



// link the scene to the camera
// renderer.render(scene, camera)

// make the canvas responsive
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth/ window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});