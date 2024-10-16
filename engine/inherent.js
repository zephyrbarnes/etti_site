const cv = document.getElementById('cv'), ct = cv.getContext("2d");
const cw = cv.width = 220, ch = cv.height = 176;
let debug = false; let facing = 0; let sector = 4; let rendering = true;
let control, scene, world, camera, renderer, aspect, player, building;
let defultMaterial, entityMaterial, slidedMaterial, bounceMaterial;
let tickID, webToggle = true;
const updates = [], dg = Math.PI / 180;

const tFx = (v, n) => {return v.toFixed(n)};

async function loadTexts(f) {
    try {
        let r = await fetch(f); if (!r.ok) throw new Error();
        let t = await r.text();
        return t.split("\n").map(l => l.split("//")[0].trim()).join("\n");
    } catch (e) { return null; }
}