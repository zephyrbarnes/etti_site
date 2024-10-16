import*as THREE from 'three';
import*as CANNON from 'cannon'
import Material from './material.js';
export default class Building{
    constructor(input, pstn) {
        this.rendered = true; this.assets = [];
        this.pstn = pstn || new THREE.Vector3(0, 0, 0);
        updates.push(this);
        this.addPreFab(input);
    }
    update() {
             if(rendering && !this.rendered) { this.addToSceneAndWorld(); this.rendered = true; }
        else if(!rendering && this.rendered) { this.removeSceneAndWorld(); this.rendered = false; }
    }

    addPreFab(input) {
        if(input == 'bedroom') {
            const roomWalls = new Material(this.pstn, defultMaterial, './models/bedroom', 0x64C84D);
            const bed = new Material(new THREE.Vector3(-2.1, .75, 2.5).add(this.pstn), bounceMaterial, './models/mattress', 0xf0ead6, 1);
            const desk = new Material(new THREE.Vector3(2, 0, 2.5).add(this.pstn), defultMaterial, './models/artDesk', 0xFFFFFF, null, null, true);
            const chair = new Material(new THREE.Vector3(0.5, .5, 2.5).add(this.pstn), slidedMaterial, './models/officeChair', 0x626F78, 2, false, true);
            const pL = new THREE.PointLight(0xffffff, 50); pL.position.set(0, 4, 0); pL.position.add(this.pstn);
            pL.castShadow = true; pL.shadow.normalBias = 0.05; scene.add(pL);
            
            roomWalls.body.material.type = CANNON.Body.STATIC;
            desk.body.material.type = CANNON.Body.STATIC;
            this.assets.push(roomWalls, bed, desk, chair, pL);
        }
    }

    addToSceneAndWorld() {
        this.assets.forEach(asset => {
            if(asset instanceof THREE.Light) scene.add(asset);
            if(asset.matr) asset.matr.visible = true;
            if(asset.body) world.addBody(asset.body);
            if(asset.update) updates.push(asset);
        });
    }

    removeSceneAndWorld() {
        this.assets.forEach(asset => {
            if(asset instanceof THREE.Light) scene.remove(asset);
            if(asset.body) world.removeBody(asset.body);
            if(asset.matr) asset.matr.visible = false;
            if(asset.update) { const index = updates.indexOf(asset);
                if (index > -1) { updates.splice(index, 1); }
            }
        });
    }
}