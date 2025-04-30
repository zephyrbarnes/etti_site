const cv = document.getElementById('cvEngine');
const ct = cvEngine.getContext("2d");
const ch = cv.height = 176;
const cw = cv.width = 220;
const PI180 = Math.PI / 180;
const PI = Math.PI;
const PI4 = PI / 4;
const PI8 = PI / 8;
let rendering = true;
let webToggle = true;
let defaultMaterial;
let entityMaterial;
let slidedMaterial;
let bounceMaterial;
let debug = false;
let sctr = 4, dir = 0;
let land;
let mode = 'play';
let previousMode = mode;
let building;
let renderer;
let control;
let camera;
let aspect;
let player;
let tickID;
let persp;
let ortho;
let first;
let scene;
let world;
const updates = [];

const tFx = (v, n) => {return v.toFixed(n)};

async function loadTexts(f) {
    try {
        let r = await fetch(f);
        if (!r.ok) throw new Error();
        let t = await r.text();
        return t.split("\n").map(l => l.split("//")[0].trim()).join("\n");
    } catch (e) { return null; }
}