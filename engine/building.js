import * as CANNON from 'cannon';
import * as THREE from 'three';
import Material from './material.js';
export default class Building{
    constructor(input, position) {
        this.rendered = true; this.assets = [];
        this.position = position || new THREE.Vector3(0, 0, 0);
        updates.push(this);
        this.addPreFab(input);
    }
    update() {
             if(rendering && !this.rendered) { this.addToSceneAndWorld(); this.rendered = true; }
        else if(!rendering && this.rendered) { this.removeSceneAndWorld(); this.rendered = false; }
    }

    addPreFab(input) {
        if(input == 'bedroom') {
            const roomWalls = new Material(this.position, defaultMaterial, './assets/models/bedroom', 0x64C84D);
            const bed = new Material(new THREE.Vector3(-2.1, .75, 2.5).add(this.position),
                                        bounceMaterial, './assets/models/mattress', 0xf0ead6, 1);
            const chair = new Material(new THREE.Vector3(0.5, .5, 2.5).add(this.position),
                        slidedMaterial, './assets/models/officeChair', 0x626F78, 2, false, true);
            const desk = new Material(new THREE.Vector3(2, 0, 2.5).add(this.position),
                     defaultMaterial, './assets/models/artDesk', 0xFFFFFF, null, null, true);
            const pL = new THREE.PointLight(0xffffff, 50);
            pL.position.add(this.position);
            pL.shadow.normalBias = 0.05;
            pL.position.set(0, 4, 0);
            pL.castShadow = true;
            scene.add(pL);
            
            roomWalls.body.material.type = CANNON.Body.STATIC;
            desk.body.material.type = CANNON.Body.STATIC;
            this.assets.push(roomWalls, bed, desk, chair, pL);
        }
    }

    addToSceneAndWorld() {
        this.assets.forEach(asset => {
            if(asset instanceof THREE.Light) scene.add(asset);
            if(asset.material) asset.material.visible = true;
            if(asset.body) world.addBody(asset.body);
            if(asset.update) updates.push(asset);
        });
    }

    removeSceneAndWorld() {
        this.assets.forEach(asset => {
            if(asset instanceof THREE.Light) scene.remove(asset);
            if(asset.body) world.removeBody(asset.body);
            if(asset.material) asset.material.visible = false;
            if(asset.update) { const index = updates.indexOf(asset);
                if (index > -1) { updates.splice(index, 1); }
            }
        });
    }
}