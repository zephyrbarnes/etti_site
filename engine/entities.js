import * as CANNON from 'cannon';
import * as THREE from 'three';
const above = new CANNON.Vec3(0, 1, 0);
export default class Entity {
    temp = new Image(); tmp2 = new Image();
    color = this.rgbToHex(190, 173, 209);
    previous = 4; frame = 4; faced = 0;
    vlc = new THREE.Vector3();
    display = true;
    ground = false;
    sprite = [];
    ang = 0;
    jump = 1;
    num = 0;
    mesh = new THREE.Group();
    constructor(path, position, size, speed) {
        position.y += 1;
        Object.assign(this, {
            size: size || 22,
            speed: speed || 8,
            jumpSpeed: speed / 1.5 || 8 / 1.5,
            body: new CANNON.Body({
                material: entityMaterial,
                fixedRotation: true,
                position: position,
                mass: 1 }),
            path: path,
        });
        this.addToBody(0,   0, 0, 'cyl', 0.385, 0.385, 1.2, 8);
        this.addToBody(0,-.53, 0, 'sph', 0.375, PI, PI / 2);
        this.addToBody(0, .53, 0, 'sph', 0.375, 0, PI / 2);
        world.addBody(this.body);
        scene.add(this.mesh);
        updates.push(this);
        this.loadImages();
    }

    addToBody(x, y, z, type, a, b, c, d) {
        let shape;
        const quaternion = new CANNON.Quaternion();
        const material = new THREE.MeshBasicMaterial({color:0xFF0000, visible:false, wireframe:true});
        if(type == 'cyl') {
            const body = new CANNON.Cylinder( a, b, c, d );
            shape = new THREE.CylinderGeometry(a, b, c, d, undefined, true);
            this.body.addShape(body, new CANNON.Vec3(x, y, z), quaternion);
        }else if(type == 'sph') {
            const body = new CANNON.Sphere( a);
            this.body.addShape(body, new CANNON.Vec3(x, y, z), quaternion);
            shape = new THREE.SphereGeometry(a, 6, 2, undefined, undefined, b, c);
        }
        const mesh = new THREE.Mesh(shape, material);
        mesh.position.set(x, y, z);
        this.mesh.add(mesh);
    }

    rgbToHex(r, g, b) { return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}

    loadImages() {
        const loader = new THREE.TextureLoader();
        const sprite = (map) => {
            try {
                if (this.sprite.length == 0) {
                    this.tileHorizontal = map.image.width / this.size;
                    this.tileVertical = map.image.height/ this.size;
                }else this.color = null;

                map.magFilter = THREE.NearestFilter;
                const sprite = new THREE.Sprite(new THREE.MeshBasicMaterial({
                    transparent:true,
                    color:this.color,
                    visible:true,
                    map:map,
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
        Object.assign(this, { mF:c.mF, mB:c.mB, mL:c.mL, mR:c.mR, mJ:c.mJ});
        this.move();
        this.mesh.quaternion.copy(this.body.quaternion);
        this.mesh.position.copy(this.body.position);
        this.reface();
    }

    move() {
        this.vlc.set(0,0,0);

        if (debug && camera === first) {
            const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
            const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion).normalize();
    
            // Handle movement inputs
            if (this.mF ^ this.mB) this.vlc[this.mF ? 'add' : 'sub'](forward);
            if (this.mL ^ this.mR) this.vlc[this.mL ? 'sub' : 'add'](right);

            this.vlc.normalize().multiplyScalar(this.speed);

            this.body.velocity.set(this.vlc.x, this.vlc.y, this.vlc.z);
            this.body.position.vadd(this.vlc.clone().multiplyScalar(0.1), this.body.position);
            
            return;
        }

        const right = new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion).normalize();
        const forward = new THREE.Vector3(right.z,0,-right.x);
        if(this.mF^this.mB) this.vlc[this.mF ? 'add':'sub'](forward);
        if(this.mL^this.mR) this.vlc[this.mL ? 'sub':'add'](right);
        this.vlc.normalize().multiplyScalar(this.speed);
        this.collision();

        if(this.mJ && this.jump > 0) {
            this.ground = false; this.jump = 0;
            this.body.velocity.y = this.jumpSpeed;
        }else if(this.body.velocity.y > 0 && this.jump) this.body.velocity.y = 0;

        this.body.velocity.set(this.vlc.x, this.body.velocity.y, this.vlc.z);
    }
    
    collision() {
        let ang = null;
        const n = new CANNON.Vec3();
        const body = this.body;
        const v = this.vlc;
        world.contacts.forEach(contact => {
            if(contact.bi == body || contact.bj == body) {
                const contactBody = contact.bi == body ? contact.bj : contact.bi;
                contact.bi == body ? contact.ni.negate(n): n.copy(contact.ni);

                if(Math.abs(n.x) < 1e-4) n.x = 0;
                if(Math.abs(n.z) < 1e-4) n.z = 0;

                ang = n.dot(above);

                if(ang <= 0.7) body.material = slidedMaterial;
                if(ang != 0 && ang <= 0.7) {
                    if(v.x * n.x < 0) v.x = 0;
                    if(v.z * n.z < 0) v.z = 0;
                    this.ground = true;
                }else if(ang > 0.7) {
                    body.material = entityMaterial;
                    this.ground = true;
                    this.jump = 1;
                }

                if(contactBody.material == bounceMaterial && ang > 0.7) {
                    this.jumpSpeed = this.speed / 1.5 * 2;
                }else this.jumpSpeed = this.speed / 1.5;
            }
        });
        if(this.ground && ang <= 0.7 && ang != 0 && body.velocity.y > 0) body.velocity.y = 0;
    }

    reface() {
        if(dir !== 0) { this.num += 5;
            if (this.num > 18) { this.num = 0;
                this.frame = (this.frame + 1) % 8;
            }
            this.faced = dir % 9;
            this.previous = (this.faced + 9) % 9;
        }else{
            this.frame = this.previous;
            this.faced = 0;
        }
        this.mesh.children.forEach(child => {
            if(camera != first) child.material.visible = debug
        });
        this.sprite.forEach(sprite => {
            this.shiftTile(sprite);
            if(this.display) {
                sprite.material.visible = true;
                sprite.material.visible = !debug;
            }else{
                sprite.material.visible = false;
            }
            sprite.rotation.set(0, control.ang, 0);
            sprite.position.copy(this.mesh.position);
        })
    }

    shiftTile(sprite) {
        const horizontal = this.tileHorizontal;
        const vertical = this.tileVertical;
        let direction;
        let face = direction = this.faced;
        let frame = this.frame;
        let mirror = false;
        const transform = {
            0: () => { if (frame > 4) { frame = 8 - frame; mirror = true; } },
            5: () => { direction = 3; },
            6: () => { direction = 2; },
            7: () => { direction = 1; },
            8: () => { direction = 5; }
        };
        
        if ([8, 4].includes(face) && frame > 3) {
            frame -= 4;
            if (frame === 4) frame = 0;
            mirror = true;
        }
        
        if ([5, 6, 7].includes(face)) {
            frame = (frame + 4) % 8;
            mirror = true;
        }
        
        if (transform[face]) transform[face]();

        let crop = direction * horizontal + frame;
        let xPosition = (crop % horizontal) / horizontal;
        let yPosition = (vertical - Math.floor(crop/horizontal) - 1) / vertical;
    
        sprite.material.map.offset.set(xPosition, yPosition);
        sprite.material.map.repeat.set(mirror ? -1 / horizontal : 1 / horizontal, 1 / vertical);
        if (mirror) { sprite.material.map.offset.x = xPosition + 1 / horizontal; }
    }
}