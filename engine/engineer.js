import * as THREE from 'three';
import * as CANNON from 'cannon'
import Renderer from './renderer.js';
import Building from './building.js';
import Controls from './controls.js';
import Entities from './entities.js';

class Land {
    constructor(gridSize = 50, cellSize = 10, materialOptions = { color: 0xFFFFFF, side: THREE.DoubleSide }) {
        this.gridSize = gridSize;
        this.cellSize = cellSize;

        // Create the mesh
        const planeGeometry = new THREE.PlaneGeometry(gridSize * cellSize, gridSize * cellSize, gridSize, gridSize);
        const planeMaterial = new THREE.MeshPhongMaterial(materialOptions);
        this.mesh = new THREE.Mesh(planeGeometry, planeMaterial);
        this.mesh.receiveShadow = true;

        // Create the physics body
        const planeShape = new CANNON.Plane();
        const planeMaterialCannon = new CANNON.Material({ friction: 0.1 });
        this.body = new CANNON.Body({
            type: CANNON.Body.STATIC,
            shape: planeShape,
            material: planeMaterialCannon,
        });

        // Position and orientation
        this.mesh.position.y = -0.01;
        this.body.position.y = 0.1;
        this.body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        this.mesh.quaternion.copy(this.body.quaternion);
    }

    addToWorld(world, scene) {
        world.addBody(this.body);
        scene.add(this.mesh);
    }

    removeFromWorld(world, scene) {
        world.removeBody(this.body);
        scene.remove(this.mesh);
    }
}

const render = new Renderer();

land = new Land(50, 1);
land.addToWorld(world, scene);

player = new Entities('./assets/user/topDwn', new CANNON.Vec3(1.5, 0, 2.5));
building = new Building('bedroom');
control = new Controls(player);

export default function animate() { render.render();
    tickID = requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}, false);