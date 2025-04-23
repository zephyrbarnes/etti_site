import * as CANNON from 'cannon';
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

export default class construct {
    constructor(position, material, path, color, mass, render, extrude) {
        this.body = new CANNON.Body({position: position, mass: mass, material: material});
        this.material = new THREE.MeshPhongMaterial({color: color, wireframe:false});
        this.mesh = new THREE.Group();
        this.render = render ?? true;
        this.position = position;
        this.path = path;
        loadTexts(this.path + '.txt').then(t => { if(t) {
            t.split("\n").forEach(line => {
                const [x,y,z,t,a,b,c,d,e,f,g] = line.trim("\r").split(" ");
                this.addToBody(x,y,z,t,a,b,c,d,e,f,g);
            });
        }}).catch(e => console.error("Failed load:" + this.path, e));
        world.addBody(this.body);
        scene.add(this.mesh);
        if(extrude) this.loadOBJ();
        updates.push(this);
    }

    update() {
        const { body, material, mesh } = this;
        if(material.wireframe != debug) material.wireframe = debug;
        if(body && body.tp != CANNON.Body.STATIC) {
            mesh.position.copy(body.position); mesh.quaternion.copy(body.quaternion);
        }
    }

    loadOBJ() {
        new OBJLoader().load(this.path +'.obj',
            (o) => { this.mesh.add(o);
                o.traverse((c) => {
                    if(c instanceof THREE.Mesh) {
                        c.material = this.material;
                        c.receiveShadow = true;
                        c.castShadow = true;
                    }});
            }, (xhr) => {}, (e) => { console.error('An error happened', e)}
        );
    }

    addToBody(x, y, z, tp, a, b, c, d, e, f, g) {
        let body = null;
        let mesh = null;
        const dg = PI180;
        const position = new CANNON.Vec3(x, y, z);
        const quaternion = new CANNON.Quaternion();
        switch(tp) {
            case 'cyl':
                body = new CANNON.Cylinder( a, b, c, d);
                quaternion.setFromEuler(e*dg, f*dg, g*dg);
                if(this.render) { mesh = new THREE.Mesh(new THREE.CylinderGeometry( a, b, c, d), this.material) }
                break;
            case 'pln':
                body = new CANNON.Box(new CANNON.Vec3( a/2, b/2, .1));
                quaternion.setFromEuler( c*dg, d*dg, e*dg);
                if(this.render && f) {
                    this.material.shadowSide = THREE.DoubleSide;
                    mesh = new THREE.Mesh(new THREE.PlaneGeometry( a, b), this.material);
                    if(g) mesh.material = this.material.clone();
                } break;
            case 'box':
                body = new CANNON.Box(new CANNON.Vec3( a/2, b/2, c/2));
                quaternion.setFromEuler( d*dg, e*dg, f*dg);
                if(this.render) { if(g) {
                    const rd = g*3;
                    a = a/2 - rd; c = c/2 - rd; b -= g*6;
                    const settings = {steps: 1, depth: b, curveSegments: 0.5, bevelEnabled:true, bevelThickness:rd, bevelSize:.05, bevelSegments: 1.5};
                    const shaped = new THREE.Shape();
                    shaped.absarc( a, c, rd,   0, 1.6);
                    shaped.absarc(-a, c, rd, 1.6, 3.2);
                    shaped.absarc(-a,-c, rd, 3.2, 4.7);
                    shaped.absarc( a,-c, rd, 4.7, 6.3);
                    let shape = new THREE.ExtrudeGeometry(shaped, settings);
                    shape.rotateX(PI/2);
                    mesh = new THREE.Mesh(shape, this.material);
                    mesh.position.set( x, y - g, z);
                } else { mesh = new THREE.Mesh(new THREE.BoxGeometry( a, b, c), this.material) }
                } break;
            default: break;
        }
        if(body) this.body.addShape(body, position, quaternion);
        if(this.render && mesh) {
            mesh.receiveShadow = true;
            mesh.castShadow = true;
            mesh.quaternion.copy(quaternion);
            this.mesh.add(mesh);
            if(!g) mesh.position.set( x, y, z);
        }
    }
}
