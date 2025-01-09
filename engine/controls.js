import * as THREE from 'three';

export default class Controls {
    key = {38:'mF', 87:'mF'/*w||forw*/,
           37:'mL', 65:'mL'/*a||left*/,
           40:'mB', 83:'mB'/*s||back*/,
           39:'mR', 68:'mR'/*d||rght*/,
           16:'shift'/*shift*/,
           32:'mJ'/*space*/,
    };
    constructor(entity) {
        Object.assign(this, {
            raycaster: new THREE.Raycaster(),
            newMaterial: null, faceId: null,
            plumbAngle: 63.435*PI180,
            adjust: 60*PI180,
            angle: 270*PI180,
            ang45: 60*PI180,
            entity: entity,
            distance: 15,
            sector: 0,
        });
        [
            ['wheel',this.onMouse],
            ['keyup',this.onClick],
            ['keydown',this.onClick],
            ['mouseup',this.onClick],
            ['mousedown',this.onClick],
            ['mousemove', this.onMouse],
            ['contextmenu',e => e.preventDefault()],
        ].forEach(([type, handler]) => document.addEventListener(type, handler.bind(this), false));
        updates.push(this);
    }

    onClick(e) {
        if(e.type === 'mousedown' || e.type === 'mouseup') { const isDown = e.type === 'mousedown';
            this.rght = e.button == 2 ? isDown:this.rght; this.left = e.button == 0 ? isDown:this.left;
        return}
        if(this.key[e.keyCode] != undefined) this[this.key[e.keyCode]] = e.type == 'keydown';
        else if(e.keyCode === 13 && e.type === 'keydown') rendering = !rendering;
        else if(e.keyCode === 80 && e.type === 'keydown') debug = !debug;
        else if(!(e.type === 'keydown')) facing = 0;
    }

    onMouse(e) {
        if(webToggle) return;
        const adjustCamera = (a, b, c, d, e, f, g) => {
            Object.assign(camera, { zoom: c, fov: d, near: e, far: f });
            Object.assign(this, { adjust: a, distance: b });
            scene.fog = g;
        };

        const indx = (X, Y) => {
            const a = Math.atan2(Y - window.innerHeight / 2, X - window.innerWidth / 2);
            sector = Math.floor(((a < 0 ? a + 2*PI : a) + PI8) / PI4) % 8;
        };
        if(e.type == 'mousemove') {
            const { clientX: X, clientY: Y } = e;
            const entity = this.entity;
            indx(X, Y);
            if(facing == 0) {
                entity.frame = sector;
                entity.previous = (sector + 10) % 8;
            }
            if(this.rght && sector != this.sector) {
                this.angle += ((sector - this.sector + 8) % 8 <= 4 ? 1:-1) * PI4;
                this.sector = sector;
            }
        }else if(e.type == 'wheel') { 
            const delta = e.deltaY*0.01;
            if (camera.fov >= 71) {
                camera.fov = Math.min(120, Math.max(1, camera.fov + delta));
                if(camera.fov <= 70) adjustCamera(this.plumbAngle, 5000, 4.3, 1, 4500, 5500, null);
            }else
            if (camera.fov <= 45) {
                camera.zoom = Math.min(20, camera.zoom - delta*0.05);
                if(camera.zoom < 4.3) adjustCamera(this.ang45, 15, 1, 71, .1, 100, null);
            }
            camera.updateProjectionMatrix();
        }
    }
    
    assignEntity(entity) { this.entity = entity; }
    
    update() {
        const m = this;
        if((!m.mR && !m.mL || m.mR && m.mL) &&
           (!m.mF && !m.mB || m.mF && m.mB)) facing = 0;
        else if(m.mF && (!m.mR && !m.mL || m.mR && m.mL)) facing = 8;
        else if(m.mR && (!m.mF && !m.mB || m.mF && m.mB)) facing = 2;
        else if(m.mB && (!m.mR && !m.mL || m.mR && m.mL)) facing = 4;
        else if(m.mL && (!m.mF && !m.mB || m.mF && m.mB)) facing = 6;
        else if(m.mF && m.mR) facing = 1;
        else if(m.mB && m.mR) facing = 3;
        else if(m.mB && m.mL) facing = 5;
        else if(m.mF && m.mL) facing = 7;
        else facing = 0;

        if(this.entity) {
            camera.position.setFromSphericalCoords(this.distance, this.adjust, this.angle);
            camera.position.add(this.entity.mesh.position);
            camera.lookAt(this.entity.mesh.position);
            this.entity.reface();
        }
    }
}