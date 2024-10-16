import * as THREE from 'three'
import * as CANNON from 'cannon'
const above = new CANNON.Vec3(0, 1, 0);
export default class Entity { vlc = new THREE.Vector3(); radi = 0.375; sprite = [];
    temp = new Image(); tmp2 = new Image(); color = this.rgbToHex(190, 173, 209);
    constructor(path, pstn, size, spd) { pstn.y += 1; this.path = path;
        Object.assign(this, { size: size || 22, spd: spd || 8, angle:0,
            num: 0, frame: 4,faced: 0, prev: 4, jump: 1, grnd: false,
        });
        this.jumpSpd = this.spd / 1.5;
        this.mesh = new THREE.Group();
        this.body = new CANNON.Body({mass:1, position: pstn, fixedRotation:true, material:entityMaterial});
        this.addToBody(0,   0, 0, 'cyl', this.radi + .01, this.radi + .01, 1.2, 8);
        this.addToBody(0,-.53, 0, 'sph', this.radi, Math.PI, Math.PI / 2);
        this.addToBody(0, .53, 0, 'sph', this.radi, 0, Math.PI / 2);
        world.addBody(this.body);
        scene.add(this.mesh);
        updates.push(this);
        this.loadImages();
    }

    addToBody(x, y, z, type, a, b, c, d) {
        let shpe; const quat = new CANNON.Quaternion();
        const matr = new THREE.MeshBasicMaterial({color:0xFF0000, visible:false, wireframe:true});
        if(type == 'cyl') { const body = new CANNON.Cylinder( a, b, c, d );
            shpe = new THREE.CylinderGeometry(a, b, c, d, undefined, true);
            this.body.addShape(body, new CANNON.Vec3(x, y, z), quat);
        }else if(type == 'sph') { const body = new CANNON.Sphere( a);
            this.body.addShape(body, new CANNON.Vec3(x, y, z), quat);
            shpe = new THREE.SphereGeometry(a, 6, 2, undefined, undefined, b, c);
        }
        const mesh = new THREE.Mesh(shpe, matr); mesh.position.set(x, y, z); this.mesh.add(mesh);
    }

    rgbToHex(r, g, b) { return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}

    loadImages() {
        const loader = new THREE.TextureLoader();
        const sprite = (map) => {
            try {
                if (this.sprite.length == 0) {
                    this.tileHorz = map.image.width / this.size;
                    this.tileVert = map.image.height/ this.size;
                }else this.color = null;
                map.magFilter = THREE.NearestFilter;
                const sprite = new THREE.Sprite(new THREE.MeshBasicMaterial({
                    map:map, transparent:true, visible:true, color:this.color
                }));
                sprite.scale.set(2*.9, 2);
                this.sprite.push(sprite); scene.add(sprite);
            } catch (e) { console.error('Sprite error:', e)}
        };
        const images = ['Map.png', '.png'].map(ext => this.path + ext);
        const txr = (p) => {return new Promise((resolve, reject) => {loader.load(p, resolve, undefined, reject)})};
        Promise.all(images.map(txr)).then(t => {t.forEach(sprite)})
        .catch(e => {console.error('Texture error:', e)});
    }

    update() {
        const c = control;
        Object.assign(this, { mF:c.mF, mB:c.mB, mL:c.mL, mR:c.mR, mJ:c.mJ}); this.move();
        this.mesh.quaternion.copy(this.body.quaternion); this.mesh.position.copy(this.body.position);
        this.reface();
    }

    move() { this.vlc.set(0,0,0);
        const rght = new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion).normalize();
        const forw = new THREE.Vector3(rght.z,0,-rght.x);
        if(this.mF^this.mB) this.vlc[this.mF ? 'add':'sub'](forw);
        if(this.mL^this.mR) this.vlc[this.mL ? 'sub':'add'](rght);
        this.vlc.normalize().multiplyScalar(this.spd); this.collision();
        if(this.mJ && this.jump > 0) {
            this.grnd = false; this.jump = 0;           this.body.velocity.y = this.jumpSpd;
        }else if(this.body.velocity.y > 0 && this.jump) this.body.velocity.y = 0;
        this.body.velocity.set(this.vlc.x, this.body.velocity.y, this.vlc.z);
    }
    
    collision() { let angle = null;
        const n = new CANNON.Vec3(), b = this.body, v = this.vlc;
        world.contacts.forEach(c => { if(c.bi == b || c.bj == b) {
            const cntBody = c.bi == b ? c.bj : c.bi;
            c.bi == b ? c.ni.negate(n):n.copy(c.ni);
            if(Math.abs(n.x) < 1e-4) n.x = 0;
            if(Math.abs(n.z) < 1e-4) n.z = 0;
            angle = n.dot(above); if(angle <= 0.7) b.material = slidedMaterial;
            if(angle != 0 && angle <= 0.7) {
                if(v.x * n.x < 0) v.x = 0; if(v.z * n.z < 0) v.z = 0;
                                    this.grnd = true;
            }else if(angle > 0.7) { this.grnd = true; b.material = entityMaterial; this.jump = 1 }
            if(cntBody.material == bounceMaterial && angle > 0.7) {
                this.jumpSpd = this.spd / 1.5 * 2;
            }else this.jumpSpd = this.spd / 1.5;
        }});
        if(this.grnd && angle <= 0.7 && angle != 0 && b.velocity.y > 0) b.velocity.y = 0;
    }

    reface() {
        if(facing != 0) { this.num += 5;
            if (this.num > 35) { this.num = 0; this.frame = (this.frame + 1) % 8; }
            this.faced = facing % 9; this.prev = (this.faced + 9) % 9;
        }else{ this.frame = this.prev; this.faced = 0; }
        this.mesh.children.forEach(c => { c.material.visible = debug });
        this.sprite.forEach(sprite => {
            this.shiftTile(sprite);
            sprite.material.visible = !debug;
            sprite.rotation.set(0, control.ang, 0);
            sprite.position.copy(this.mesh.position);
        })
    }

    shiftTile(sprite) {
        const hrz = this.tileHorz, vrt = this.tileVert;
        let dr, fc = dr = this.faced; // Direction&Facing
        let f = this.frame,/*Frame*/ m = false; // Mirror
        const transform = { // Transformations for Facing
            0: () => { if(f > 4) { f = 8 - f; m = true;}},
            5: () => { dr = 3; f = (f + 4) % 8; m = true; },
            6: () => { dr = 2; f = (f + 4) % 8; m = true; }, 
            7: () => { dr = 1; f = (f + 4) % 8; m = true; },
            8: () => { dr = 5; if(f > 3) { f -= 4; if(f == 4) f = 0; m = true;}},
            4: () => { if(f > 3) { f -= 4; if(f == 4) f = 0; m = true;}},
        }; if(transform[fc]) transform[fc](); // Apply Transformations

        let cr = dr * hrz + f, xP = (cr % hrz) / hrz;
        let yP = (vrt - Math.floor(cr/hrz) - 1) / vrt;
    
        sprite.material.map.offset.set(xP, yP);
        sprite.material.map.repeat.set(m ? -1 / hrz : 1 / hrz, 1 / vrt);
        if (m) { sprite.material.map.offset.x = xP + 1 / hrz; }
    }
}