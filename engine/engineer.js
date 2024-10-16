import * as THREE from 'three';
import * as CANNON from 'cannon'
import Renderer from './renderer.js';
import Building from './building.js';
import Controls from './controls.js';
import Entities from './entities.js';

const render = new Renderer();

const groundMesh = new THREE.Mesh(new THREE.PlaneGeometry(500, 500),
    new THREE.MeshPhongMaterial({color: 0xFFFFFF, side: THREE.DoubleSide}));
const groundBody = new CANNON.Body({ shape: new CANNON.Plane(),
    type: CANNON.Body.STATIC, material: new CANNON.Material({friction:0.1})
});
scene.add(groundMesh); world.addBody(groundBody);
groundMesh.receiveShadow = true;
groundMesh.position.y = -.01; groundBody.position.y = .1;
groundBody.quaternion.setFromEuler( - Math.PI / 2, 0, 0);
groundMesh.quaternion.copy(groundBody.quaternion);

building = new Building('bedroom');
player = new Entities('./user/topDwn', new CANNON.Vec3(1.5, 0, 2.5));
control = new Controls(player);

export default function animate() { render.render();
    tickID = requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.updateProjectionMatrix();
}, false);