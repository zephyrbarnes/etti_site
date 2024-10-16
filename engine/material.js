import*as THREE from 'three';
import*as CANNON from 'cannon';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

export default class material {
    constructor(pstn, matr, path, colr, mass, rend, extr) {
        this.rend = rend ?? true; this.pstn = pstn;
        this.matr = new THREE.MeshPhongMaterial({color: colr, wireframe:false});
        this.body = new CANNON.Body({position: pstn, mass: mass, material: matr});
        this.path = path; this.mesh = new THREE.Group();
        loadTexts(this.path + '.txt').then(t => { if(t) {
            t.split("\n").forEach(line => {
                const [x,y,z,t,a,b,c,d,e,f,g] = line.trim("\r").split(" ");
                this.addToBody(x,y,z,t,a,b,c,d,e,f,g);
            });
        }}).catch(e => console.error("Failed load:" + this.path, e));
        scene.add(this.mesh); world.addBody(this.body);
        if(extr) this.loadOBJ();
        updates.push(this);
    }

    update() {
        const { body, matr, mesh } = this;
        if(matr.wireframe != debug) matr.wireframe = debug;
        if(body && body.tp != CANNON.Body.STATIC) {
            mesh.position.copy(body.position); mesh.quaternion.copy(body.quaternion);
        }
    }

    loadOBJ() {
        new OBJLoader().load(this.path +'.obj',
            (o) => { this.mesh.add(o);
                o.traverse((c) => {
                    if(c instanceof THREE.Mesh) {
                        c.material = this.matr;
                        c.castShadow = true; c.receiveShadow = true;
                    }});
            }, (xhr) => {}, (e) => { console.error('An error happened', e)}
        );
    }

    addToBody(x, y, z, tp, a, b, c, d, e, f, g) { let body = null, mesh = null;
        const pstn = new CANNON.Vec3(x, y, z), quat = new CANNON.Quaternion();
        switch(tp) {
            case 'cyl': body = new CANNON.Cylinder( a, b, c, d); quat.setFromEuler(e*dg, f*dg, g*dg);
                if(this.rend) { mesh = new THREE.Mesh(new THREE.CylinderGeometry(a, b, c, d), this.matr) }
                break;
            case 'pln': body = new CANNON.Box(new CANNON.Vec3(a/2,b/2,.1)); quat.setFromEuler(c*dg, d*dg, e*dg);
                if(this.rend && f) {
                    this.matr.shadowSide = THREE.DoubleSide;
                    mesh = new THREE.Mesh(new THREE.PlaneGeometry(a, b), this.matr);
                    if(g) mesh.material = this.matr.clone();
                } break;
            case 'box': body = new CANNON.Box(new CANNON.Vec3(a/2,b/2,c/2)); quat.setFromEuler(d*dg, e*dg, f*dg);
                if(this.rend) { if(g) { let shpe;
                    const rd = g*3, shape = new THREE.Shape();
                    a = a/2-rd; c = c/2-rd; b -= g*6;
                    shape.absarc( a, c, rd,   0, 1.6); shape.absarc(-a, c, rd, 1.6, 3.2);
                    shape.absarc(-a,-c, rd, 3.2, 4.7); shape.absarc( a,-c, rd, 4.7, 6.3);
                    const settings = { steps: 1, depth: b, curveSegments: 0.5,
                        bevelEnabled:true, bevelThickness:rd, bevelSize:.05, bevelSegments: 1.5};
                    shpe = new THREE.ExtrudeGeometry(shape, settings); shpe.rotateX(Math.PI / 2);
                    mesh = new THREE.Mesh(shpe, this.matr); mesh.position.set(x, y-g, z);
                }else { mesh = new THREE.Mesh(new THREE.BoxGeometry(a, b, c), this.matr) }
                } break;
            default: break;
        }
        if(body) this.body.addShape(body, pstn, quat);
        if(this.rend && mesh) {
            mesh.receiveShadow = true;
            mesh.castShadow = true;
            mesh.quaternion.copy(quat); this.mesh.add(mesh);
            if(!g) mesh.position.set(x, y, z);
        }
    }
}
