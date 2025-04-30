import * as CANNON from 'cannon';
import * as THREE from 'three';
export default class Renderer {
    constructor() {
        const sky = 0xADD8E6;
        this.count = this.curr = this.last = this.fps = 0;
        this.rate = 60;
        this.time = performance.now();
        renderer = new THREE.WebGLRenderer();
        renderer.domElement.style.display = 'none';
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.setClearColor(sky);
        
        let r = window.innerWidth / window.innerHeight, f = 50 / 2;
        world = new CANNON.World({ gravity: new CANNON.Vec3( 0, -10, 0) });
        scene = new THREE.Scene();
        persp = new THREE.PerspectiveCamera(72, r, .1, 100);
        ortho = new THREE.OrthographicCamera( -r * f, r * f, f, -f, 0.1, 100 );
        first = new THREE.PerspectiveCamera(70, r, .1, 100);
        scene.fog = new THREE.Fog(sky, 5, 50);
        camera = persp; camera.updateProjectionMatrix();
        
        entityMaterial = new CANNON.Material({friction:0});
        bounceMaterial = new CANNON.Material({friction:.5});
        defaultMaterial = new CANNON.Material({friction:0});
        slidedMaterial = new CANNON.Material({friction:.001});
        const touchsContact = new CANNON.ContactMaterial(defaultMaterial, entityMaterial, {restitution:0});
        const slidesContact = new CANNON.ContactMaterial(defaultMaterial, slidedMaterial, {restitution:0});
        const bounceContact = new CANNON.ContactMaterial(defaultMaterial, bounceMaterial,{restitution:.5});
        const jumpedContact = new CANNON.ContactMaterial(entityMaterial,  bounceMaterial, {restitution:1});
        world.addContactMaterial(jumpedContact);
        world.addContactMaterial(bounceContact);
        world.addContactMaterial(slidesContact);
        world.addContactMaterial(touchsContact);
        const ambientLight = new THREE.AmbientLight(0x303030);

        document.body.appendChild(renderer.domElement);
        scene.add(ambientLight);
    }

    /**
     * Increments world and frames at their own rates
     */
    render() {
        this.count++;
        this.curr = performance.now();
        world.step(1/this.rate);
        if(this.curr - this.last > 1000 / this.rate) {
            updates.forEach(u=> u.update());
            renderer.render( scene, camera);
            this.last = this.curr;
        }
        if(this.curr - this.time >= 1000) {
            this.fps = this.count; this.count = 0;
            this.time = this.curr;
        }
        this.display();
    }

    /**
     * Updates display with frames per second (fps) and player position
     */
    display() {
        const p = player.mesh.position;
        document.getElementById('timeMetr').textContent = `FPS: ${tFx((this.fps-1),0)}`;
        // document.getElementById('misc').textContent = `Misc: ${camera.quaternion.x}`;
        document.getElementById('position').textContent = `X: ${ tFx(p.x,1)} Y: ${tFx((p.y-1),1)} Z: ${ tFx(p.z,1)}`;
    }
}