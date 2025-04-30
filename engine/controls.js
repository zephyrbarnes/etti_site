import * as THREE from 'three';
import {PointerLockControls} from 'three/addons/controls/PointerLockControls.js';
let delta = 0.01;
let zoomThreshold = 35;

export default class Controls {
    key = {38:'mF', 87:'mF'/*w||forw*/, 40:'mB', 83:'mB'/*s||back*/,
           37:'mL', 65:'mL'/*a||left*/, 39:'mR', 68:'mR'/*d||rght*/,
           16:'shift'/*shift*/,
           32:'mJ'/*space*/,
    };
    constructor(ent) {
        Object.assign(this, {
            raycaster: new THREE.Raycaster(),
            fcsVt:[], fcsEg:[], selVt: [],
            mouse: new THREE.Vector2(),
            ang: 1.5*PI,
            faceId: null,
            ent: ent,
            dist: 14,
            sctr: 0,
        });

        let pntr = new PointerLockControls(first, document.body); // PointLock

        document.addEventListener('click', () => {
            if (camera == first && !document.pointerLockElement && !webToggle) {
                document.getElementById('cvEngine').requestPointerLock();
                pntr.lock();
            }
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
        if(e.type == 'mousedown' || e.type == 'mouseup') {
            const isDown = e.type == 'mousedown';
            this.left = e.button == 0 ? isDown:this.left;
            this.midl = e.button == 1 ? isDown:this.midl;
            this.rght = e.button == 2 ? isDown:this.rght;
        return}
        if(this.key[e.keyCode] != undefined) this[this.key[e.keyCode]] = e.type == 'keydown';
        else if(e.keyCode == 13 && e.type == 'keydown') rendering = !rendering;
        else if(e.keyCode == 80 && e.type == 'keydown') debug = !debug;
        else if(!(e.type == 'keydown')) dir = 0;
    }

    onMouse(e) {
        if(webToggle) return;

        const sctrIndx = (X, Y) => {
            const a = Math.atan2(Y - window.innerHeight / 2, X - window.innerWidth / 2);
            sctr = Math.floor(((a < 0 ? a + 2*PI : a) + PI8) / PI4) % 8;
        };
        if(e.type == 'mousemove') {
            const { clientX: X, clientY: Y } = e;
            const ent = this.ent; sctrIndx(X, Y);
            if(dir == 0) { ent.frame = sctr;
                ent.previous = (sctr + 10) % 8;
            }
            if (this.rght && sctr != this.sctr) { 
                this.ang += ((sctr - this.sctr + 8) % 8 <= 4 ? 1 : -1) * PI4;
                this.sctr = sctr;
            }

            function emptyHighlight() {
                this.fcsVt.forEach(vt => scene.remove(vt));
                this.fcsEg.forEach(eg => scene.remove(eg));
                this.fcsVt = []; this.fcsEg = [];
            }

            if(mode != 'land') { previousMode = mode;
                emptyHighlight.call(this);
            }else if (mode == 'land') {
                if (camera == first) { this.mouse = { x: 0, y: 0 }; }
                else this.mouse = { x: (X / window.innerWidth) * 2 - 1, y: -(Y / window.innerHeight) * 2 + 1 };
            
                this.raycaster.setFromCamera(this.mouse, camera);

                const objectsToIntersect = scene.children.filter( c => !this.fcsVt.includes(c) && !this.fcsEg.includes(c));
                const intersects = this.raycaster.intersectObjects(objectsToIntersect, true);

                if (intersects.length > 0) {
                    const obj = intersects[0].object, fce = intersects[0].face;
                    const geo = obj.geometry;

                    // Remove previous highlights
                    emptyHighlight.call(this);

                    function geoPs(i, a) { return geo.attributes.position.array[i * 3 + a]}
                    function vctPs(i) { return new THREE.Vector3(geoPs(i, 0), geoPs(i, 1), geoPs(i, 2)); }

                    // Inside the 'land' mode logic
                    if (geo && fce) {
                        const vtPos = [];
                        const ix = [fce.a, fce.b, fce.c];
                        ix.forEach(i => { const vt = vctPs(i);
                            vt.applyMatrix4(obj.matrixWorld); // Transform to world space
                            vtPos.push(vt.x, vt.y, vt.z);
                        });

                        const vertexGeometry = new THREE.BufferGeometry();
                        vertexGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vtPos, 3));

                        const vertexMaterial = new THREE.ShaderMaterial({
                            uniforms: {
                                color: { value: new THREE.Color(0xff0000) },
                                size: { value: 150.0 } // Base size, can be adjusted
                            },
                            transparent: true,
                            vertexShader: ` uniform float size;
                                void main() {
                                    gl_PointSize = size / length((modelViewMatrix * vec4(position, 1.0)).xyz);
                                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                                }
                            `,
                            fragmentShader: ` uniform vec3 color;
                                void main() { gl_FragColor = vec4(color, 1.0);
                                    if (length(gl_PointCoord - vec2(0.5)) > 0.5) discard;
                                }
                            `
                        });

                        const points = new THREE.Points(vertexGeometry, vertexMaterial);
                        this.fcsVt.push(points); // Track the highlighted vertices
                        scene.add(points);

                        // Highlight edges with tubes
                        function gtPs(i1, i2, obj) {
                            const v1 = vctPs(i1), v2 = vctPs(i2);
                            v1.applyMatrix4(obj.matrixWorld);
                            v2.applyMatrix4(obj.matrixWorld);
                            return [v1, v2];
                        }

                        const edges = [gtPs(ix[0], ix[1], obj), gtPs(ix[1], ix[2], obj), gtPs(ix[2], ix[0], obj)];

                        edges.forEach(([start, end]) => {
                            const curve = new THREE.LineCurve3(start, end);
                            const tubeGeo = new THREE.TubeGeometry(curve, 1, 0.03, 4, false); // Adjust thickness (0.05) as needed
                            const tubeMtr = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                            const tube = new THREE.Mesh(tubeGeo, tubeMtr);
                            this.fcsEg.push(tube); // Track the highlighted edges
                            scene.add(tube);
                        });
                    }
                }
            }
        }else if(e.type == 'wheel') {
            if (mode === 'play') {
                if (camera instanceof THREE.OrthographicCamera) {
                    if (camera.zoom >= 2.5) {
                        delta = -e.deltaY * 0.01 * camera.zoom;
                        camera.zoom = Math.min(100, Math.max(1, camera.zoom + delta * 0.1));
                        if (camera.zoom < 2.5) { camera = persp;
                            scene.fog.near = 5;
                            scene.fog.far = 50;
                            camera.fov = 71;
                            this.dist = 14;
                        }else if(camera.zoom > zoomThreshold) { camera = first;
                            this.ent.display = false;
                        }
                    }
                }else if (camera instanceof THREE.PerspectiveCamera) {
                    if (camera.fov >= 71) {
                        delta = -e.deltaY*0.01;
                        camera.fov = Math.min(120, Math.max(1, camera.fov - delta));
                        if (camera.fov < 71) { camera = ortho;
                            scene.fog.near = 30;
                            scene.fog.far = 100;
                            camera.zoom = 2.5;
                            this.dist = 45;
                        }
                    }
                }
            }else{}
            camera.updateProjectionMatrix();
        }
    }
    
    assignEntity(ent) { this.ent = ent; }
    
    update() {
        if(this.ent.display) { const { mF, mB, mL, mR } = this;
            const mveFlag = (mF << 3) | (mB << 2) | (mL << 1) | mR,
            dirMap = { 0b0000: 0, 0b1000: 8, 0b0100: 4, 0b0010: 6,
            0b0001: 2, 0b1001: 1, 0b0101: 3, 0b0110: 5, 0b1010: 7};
            dir = dirMap[mveFlag] || 0;
        }
        
        if (camera == first && this.midl && delta > 0) { camera = ortho;
            this.ent.display = true;
            scene.fog.near = 30;
            scene.fog.far = 100;
            camera.zoom = 35;
            this.dist = 45;
        }

        if(this.ent) {
            const targetE = this.ent.mesh.position.clone();
            targetE.y += 0.5;
            if (camera == first) { // First-person perspective
                camera.position.copy(targetE);
            } else { // Third-person perspective
                camera.position.setFromSphericalCoords(this.dist, PI/3, this.ang);
                camera.position.add(targetE);
                camera.lookAt(targetE);
            }
        }
    }
}