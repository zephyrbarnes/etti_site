import*as THREE from 'three';
const PI4 = Math.PI / 4, PI8 = Math.PI / 8, PI180 = Math.PI / 180;

export default class Controls {
    key = {38:'mF',87:'mF'/*w||forw*/, 37:'mL',65:'mL'/*a||left*/, 40:'mB',83:'mB'/*s||back*/,
           39:'mR',68:'mR'/*d||rght*/, 32:'mJ'/*space*/, 16:'shift'/*shift*/,
    };
    constructor(entity) {
        Object.assign(this, {
            faceId:null, newMat:null, sector:0, entity:entity, raycaster: new THREE.Raycaster(),
            dist:15, adj:60*PI180, ang:270*PI180, plAng:63.435*PI180, ang45:60*PI180,
        });
        [
            ['mousedown',this.onClick],['mouseup',this.onClick],['keydown',this.onClick],
            ['keyup',this.onClick], ['contextmenu',e => e.preventDefault()],['wheel',this.onMouse],
            ['mousemove', this.onMouse]
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
        const adjustCam = (a, b, c, d, e, f, g) => {
            Object.assign(camera, { zoom: c, fov: d, near: e, far: f });
            Object.assign(this, { adj: a, dist: b }); scene.fog = g;
        };
        const indx = (X, Y) => {
            const a = Math.atan2(Y - window.innerHeight / 2, X - window.innerWidth / 2);
            sector = Math.floor(((a < 0 ? a + 2*Math.PI : a) + PI8) / PI4) % 8;
        };
        if(e.type == 'mousemove') {
            const { clientX: X, clientY: Y } = e, en = this.entity; indx(X, Y);
            if(facing == 0) { en.frame = sector; en.prev = (sector + 10) % 8 }
            if(this.rght && sector != this.sector) {
                this.ang += ((sector - this.sector + 8) % 8 <= 4 ? 1:-1)*PI4;
                this.sector = sector;
            }
        }else if(e.type == 'wheel') {  const delta = e.deltaY*0.01, c = camera;
            if (c.fov >= 71) { c.fov = Math.min(120, Math.max(1, c.fov + delta));
                if(c.fov <= 70) adjustCam(this.plAng, 5000, 4.3, 1, 4500, 5500, null);
            }else
            if (c.fov <= 45) { c.zoom = Math.min(20, c.zoom - delta*0.05);
                if(c.zoom < 4.3) adjustCam(this.ang45,15,1,71,.1,100, null);
            }
            camera.updateProjectionMatrix();
        }
    }
    
    assignEntity(entity) { this.entity = entity; }
    
    update() {
        if((!this.mR && !this.mL || this.mR && this.mL) &&
           (!this.mF && !this.mB || this.mF && this.mB)) facing = 0;
        else if(this.mF && (!this.mR && !this.mL || this.mR && this.mL)) facing = 8;
        else if(this.mR && (!this.mF && !this.mB || this.mF && this.mB)) facing = 2;
        else if(this.mB && (!this.mR && !this.mL || this.mR && this.mL)) facing = 4;
        else if(this.mL && (!this.mF && !this.mB || this.mF && this.mB)) facing = 6;
        else if(this.mF && this.mR) facing = 1;
        else if(this.mB && this.mR) facing = 3;
        else if(this.mB && this.mL) facing = 5;
        else if(this.mF && this.mL) facing = 7;
        else facing = 0;

        if(this.entity) {
            camera.position.setFromSphericalCoords(this.dist, this.adj, this.ang)
            .add(this.entity.mesh.position); camera.lookAt(this.entity.mesh.position);
            this.entity.reface();
        }
    }
}