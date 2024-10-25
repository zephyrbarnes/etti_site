import * as CANNON from 'cannon';
import * as THREE from 'three';
export default class Renderer {
    constructor() {
        const sky = 0xADD8E6;
        this.count = this.curr = this.last = this.fps = 0;
        this.rate = 60;
        this.time = performance.now();
        renderer = new THREE.WebGLRenderer();
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.shadowMap.enabled = true;
        renderer.setClearColor(sky);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.domElement.style.display = 'none';
        document.body.appendChild(renderer.domElement);
        
        world = new CANNON.World({ gravity: new CANNON.Vec3( 0, -10, 0) });
        scene = new THREE.Scene(); scene.fog = new THREE.Fog(sky, 10, 100);
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
        Object.assign(camera, { near:.1, far:100, zoom:1, fov:71 });
        camera.updateProjectionMatrix();
        
        defaultMaterial = new CANNON.Material({friction:0});
        entityMaterial = new CANNON.Material({friction:0});
        bounceMaterial = new CANNON.Material({friction:.5});
        slidedMaterial = new CANNON.Material({friction:.001});
        const touchsContact = new CANNON.ContactMaterial(defaultMaterial, entityMaterial, {restitution:0});
        const slidesContact = new CANNON.ContactMaterial(defaultMaterial, slidedMaterial, {restitution:0});
        const jumpedContact = new CANNON.ContactMaterial(entityMaterial, bounceMaterial, {restitution:1});
        const bounceContact = new CANNON.ContactMaterial(defaultMaterial, bounceMaterial,{restitution:.5});
        world.addContactMaterial(jumpedContact);
        world.addContactMaterial(bounceContact);
        world.addContactMaterial(slidesContact);
        world.addContactMaterial(touchsContact);
        const ambientLight = new THREE.AmbientLight(0x303030);
        scene.add(ambientLight);
    }

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
        this.display(this.fps);
    }

    display(fps) {
        const p = player.mesh.position;
        document.getElementById('timeMetr').textContent = `FPS: ${tFx((fps-1),0)}`;
        document.getElementById('position').textContent = `X: ${ tFx(p.x,1)} Y: ${tFx((p.y-1),1)} Z: ${ tFx(p.z,1)}`;
    }
}