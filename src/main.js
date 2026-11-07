import "./style.css";
import * as THREE from "three";

const MAP = 96;
const CELL = 4;
const STORM_START = 44;
const BOT_COUNT = 11;
const SAFE_SECONDS = 8;
const BOT_RING = 38;
const LAVA_DELAY = 12;
const BOSS_HP = 9000;

const overlay = document.getElementById("overlay");
const startBtn = document.getElementById("start-btn");
const hud = document.getElementById("hud");
const hpFill = document.getElementById("hp-fill");
const hpText = document.getElementById("hp-text");
const shieldFill = document.getElementById("shield-fill");
const shieldText = document.getElementById("shield-text");
const woodText = document.getElementById("wood-text");
const aliveText = document.getElementById("alive-text");
const stormText = document.getElementById("storm-text");
const killsHud = document.getElementById("kills-text");
const bossHud = document.getElementById("boss-hud");
const bossFill = document.getElementById("boss-fill");
const bossHpText = document.getElementById("boss-hp");
const bannerEl = document.getElementById("banner");
const centerCountdown = document.getElementById("center-countdown");
const countdownLabel = document.getElementById("countdown-label");
const countdownNum = document.getElementById("countdown-num");
const killfeedEl = document.getElementById("killfeed");
const ammoText = document.getElementById("ammo-text");
const weaponNameEl = document.getElementById("weapon-name");
const careerLine = document.getElementById("career-line");
const panels = {
  home: document.getElementById("panel-home"),
  pause: document.getElementById("panel-pause"),
  results: document.getElementById("panel-results"),
  howto: document.getElementById("panel-howto"),
  settings: document.getElementById("panel-settings"),
};
const minimap = document.getElementById("minimap");
const miniCtx = minimap.getContext("2d");
const slots = [...document.querySelectorAll(".slot[data-mode]")];
const skillTreeEl = document.getElementById("skill-tree");
const skillBranches = document.getElementById("skill-branches");
const skillPointsEl = document.getElementById("skill-points");
const skillHelpEl = document.getElementById("skill-help");
const spText = document.getElementById("sp-text");
const winsText = document.getElementById("wins-text");
const levelText = document.getElementById("level-text");

const keys = new Set();
let justSpace = false;
let justStomp = false;
const scene = new THREE.Scene();
scene.background = new THREE.Color("#7ec8ff");
scene.fog = new THREE.Fog("#7ec8ff", 40, 130);

const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 200);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
document.body.prepend(renderer.domElement);

const hemi = new THREE.HemisphereLight("#d7f3ff", "#3d6b3a", 1.1);
scene.add(hemi);
const sun = new THREE.DirectionalLight("#fff4d2", 1.4);
sun.position.set(40, 70, 18);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
scene.add(sun);

const island = new THREE.Mesh(
  new THREE.CylinderGeometry(MAP / 2 + 4, MAP / 2 + 8, 6, 48),
  new THREE.MeshLambertMaterial({ color: "#3fa85a", emissive: "#000000" })
);
island.position.y = -3;
island.receiveShadow = true;
scene.add(island);

const water = new THREE.Mesh(
  new THREE.CircleGeometry(160, 48),
  new THREE.MeshLambertMaterial({ color: "#2f8fd6" })
);
water.rotation.x = -Math.PI / 2;
water.position.y = -3.2;
scene.add(water);

function addProp(geometry, color, x, z, y, rotY = 0) {
  const mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color }));
  mesh.position.set(x, y, z);
  mesh.rotation.y = rotY;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

const trees = [];
const landmarkMeshes = [];
const landmarkSolids = [];
const chests = [];

const MAPS = [
  {
    name: "Grass Isle",
    sky: "#7ec8ff",
    ground: "#3fa85a",
    water: "#2f8fd6",
    hemiSky: "#d7f3ff",
    hemiGround: "#3d6b3a",
    sun: "#fff4d2",
    trunk: "#7a4a28",
    leaves: "#1f8a45",
    treeCount: 26,
    chestRing: 22,
    landmarks: [
      [18, -8, "#f0d27a"],
      [-22, 16, "#e27d60"],
      [8, 24, "#85c7f2"],
      [-10, -26, "#c9a0dc"],
    ],
  },
  {
    name: "Dune Outpost",
    sky: "#f0c27a",
    ground: "#d2a35c",
    water: "#c98a4a",
    hemiSky: "#ffe7c2",
    hemiGround: "#8a5a28",
    sun: "#ffd89a",
    trunk: "#8a6230",
    leaves: "#c4a35a",
    treeCount: 10,
    chestRing: 18,
    landmarks: [
      [16, 12, "#c47a3a"],
      [-20, -10, "#e8c99a"],
      [6, -24, "#a86b3c"],
      [24, 4, "#f3d6a4"],
    ],
  },
  {
    name: "Frost Ring",
    sky: "#c5e5ff",
    ground: "#dce9f4",
    water: "#8ec8e8",
    hemiSky: "#eef7ff",
    hemiGround: "#7a93a8",
    sun: "#f2fbff",
    trunk: "#6b5344",
    leaves: "#d8f0f2",
    treeCount: 22,
    chestRing: 26,
    landmarks: [
      [20, -12, "#e8f4ff"],
      [-16, 20, "#b9d4ea"],
      [10, 26, "#ffffff"],
      [-24, -8, "#9bb8d0"],
    ],
  },
  {
    name: "Neon Yard",
    sky: "#1a1030",
    ground: "#2a3348",
    water: "#12182a",
    hemiSky: "#5a4a88",
    hemiGround: "#1a2030",
    sun: "#ff7ad9",
    trunk: "#3a2a22",
    leaves: "#3dffc0",
    treeCount: 14,
    chestRing: 20,
    landmarks: [
      [14, -18, "#ff4fd8"],
      [-22, 8, "#4fd2ff"],
      [22, 16, "#b6ff4f"],
      [-8, -26, "#ffa646"],
    ],
  },
  {
    name: "Ember Peak",
    sky: "#4a1c14",
    ground: "#4a2a22",
    water: "#7a1e12",
    hemiSky: "#ff8a4a",
    hemiGround: "#2a1210",
    sun: "#ff5a2a",
    trunk: "#2a1814",
    leaves: "#8a2a18",
    treeCount: 12,
    chestRing: 16,
    landmarks: [
      [12, 14, "#6a2a22"],
      [-18, -16, "#c45a28"],
      [24, -6, "#3a2018"],
      [-10, 24, "#e07030"],
    ],
  },
];

function currentMap() {
  return MAPS[wins % MAPS.length];
}

function addTree(x, z, theme) {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38, 0.52, 3.2, 6),
    new THREE.MeshLambertMaterial({ color: theme.trunk }),
  );
  trunk.position.y = 1.6;
  trunk.castShadow = true;
  const leaves = new THREE.Mesh(
    new THREE.ConeGeometry(2.1, 3.4, 7),
    new THREE.MeshLambertMaterial({ color: theme.leaves }),
  );
  leaves.position.y = 4.2;
  leaves.castShadow = true;
  group.add(trunk, leaves);
  group.position.set(x, 0, z);
  scene.add(group);
  trees.push({ group, hp: 40, maxHp: 40, dead: false, respawn: 0, x, z });
  return group;
}

const GUNS = {
  pistol: { name: "Pistol", dmg: 1, cd: 1, ammo: "light", color: "#7dffb3" },
  rifle: { name: "Tactical Rifle", dmg: 1.28, cd: 0.7, ammo: "medium", color: "#85c7f2" },
  shotgun: { name: "Pump Shotgun", dmg: 2.15, cd: 1.55, ammo: "shell", color: "#ffd166" },
};

function addChest(x, z) {
  const group = new THREE.Group();
  const crate = new THREE.Mesh(
    new THREE.BoxGeometry(1.9, 1.25, 1.5),
    new THREE.MeshLambertMaterial({ color: "#ffcc33" }),
  );
  crate.position.y = 0.65;
  crate.castShadow = true;
  const beacon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.09, 7.5, 6),
    new THREE.MeshBasicMaterial({ color: "#ffe566" }),
  );
  beacon.position.y = 4.4;
  const gem = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.5),
    new THREE.MeshBasicMaterial({ color: "#fff7a0" }),
  );
  gem.position.y = 8.3;
  group.add(crate, beacon, gem);
  group.position.set(x, 0, z);
  scene.add(group);
  chests.push({ mesh: group, crate, beacon, gem, x, z, open: false });
}

function clearWorldProps() {
  for (const tree of trees) scene.remove(tree.group);
  trees.length = 0;
  for (const chest of chests) scene.remove(chest.mesh);
  chests.length = 0;
  for (const mesh of landmarkMeshes) scene.remove(mesh);
  landmarkMeshes.length = 0;
  landmarkSolids.length = 0;
}

function applyMap(theme) {
  scene.background = new THREE.Color(theme.sky);
  scene.fog = new THREE.Fog(theme.sky, 40, 130);
  island.material.color.set(theme.ground);
  island.material.emissive.set("#000000");
  water.material.color.set(theme.water);
  hemi.color.set(theme.hemiSky);
  hemi.groundColor.set(theme.hemiGround);
  sun.color.set(theme.sun);
  clearWorldProps();
  for (let i = 0; i < theme.treeCount; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 10 + Math.random() * 38;
    addTree(Math.cos(a) * r, Math.sin(a) * r, theme);
  }
  for (const [x, z, color] of theme.landmarks) {
    const main = addProp(new THREE.BoxGeometry(8, 5, 8), color, x, z, 2.5);
    const tower = addProp(new THREE.BoxGeometry(3, 7, 3), "#dfe7ef", x + 2.2, z - 2, 3.5);
    landmarkMeshes.push(main, tower);
    landmarkSolids.push(main, tower);
  }
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.4;
    addChest(Math.cos(a) * theme.chestRing, Math.sin(a) * theme.chestRing);
  }
}

applyMap(MAPS[0]);

const stormRing = new THREE.Mesh(
  new THREE.RingGeometry(STORM_START - 0.6, STORM_START + 0.6, 64),
  new THREE.MeshBasicMaterial({ color: "#c45cff", side: THREE.DoubleSide, transparent: true, opacity: 0.55 })
);
stormRing.rotation.x = -Math.PI / 2;
stormRing.position.y = 0.12;
scene.add(stormRing);

const builds = [];
const projectiles = [];
const actors = [];

function gridSnap(v) {
  return Math.round(v / CELL) * CELL;
}

function makePawn(color, x, z, isPlayer = false) {
  const root = new THREE.Group();
  const shirt = new THREE.MeshLambertMaterial({ color });
  const skin = new THREE.MeshLambertMaterial({ color: "#f0c7a0" });
  const pants = new THREE.MeshLambertMaterial({ color: "#243044" });
  const boot = new THREE.MeshLambertMaterial({ color: "#1a1410" });
  const addMesh = (parent, geo, mat, px, py, pz) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(px, py, pz);
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const torso = addMesh(root, new THREE.CapsuleGeometry(0.32, 0.62, 4, 8), shirt, 0, 1.38, 0);
  addMesh(root, new THREE.SphereGeometry(0.28, 12, 12), skin, 0, 1.92, 0);
  const makeArm = (side) => {
    const arm = new THREE.Group();
    arm.position.set(side * 0.4, 1.58, 0);
    addMesh(arm, new THREE.CapsuleGeometry(0.075, 0.32, 3, 6), skin, 0, -0.26, 0);
    addMesh(arm, new THREE.CapsuleGeometry(0.065, 0.3, 3, 6), skin, 0, -0.62, 0.04);
    addMesh(arm, new THREE.SphereGeometry(0.07, 8, 8), skin, 0, -0.84, 0.06);
    root.add(arm);
    return arm;
  };
  const makeLeg = (side) => {
    const leg = new THREE.Group();
    leg.position.set(side * 0.15, 1.02, 0);
    addMesh(leg, new THREE.CapsuleGeometry(0.1, 0.38, 3, 6), pants, 0, -0.26, 0);
    addMesh(leg, new THREE.CapsuleGeometry(0.085, 0.36, 3, 6), pants, 0, -0.66, 0.02);
    addMesh(leg, new THREE.BoxGeometry(0.16, 0.1, 0.28), boot, 0, -0.92, 0.06);
    root.add(leg);
    return leg;
  };
  const lArm = makeArm(-1);
  const rArm = makeArm(1);
  const lLeg = makeLeg(-1);
  const rLeg = makeLeg(1);
  const tool = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.12, 1.1),
    new THREE.MeshLambertMaterial({ color: isPlayer ? "#7dffb3" : "#ffb703" })
  );
  tool.position.set(0.06, -0.78, 0.42);
  rArm.add(tool);
  const axe = new THREE.Group();
  const handle = new THREE.Mesh(
    new THREE.BoxGeometry(0.09, 1.15, 0.09),
    new THREE.MeshLambertMaterial({ color: "#6b3a1f" }),
  );
  handle.position.y = 0.35;
  const blade = new THREE.Mesh(
    new THREE.BoxGeometry(0.58, 0.28, 0.08),
    new THREE.MeshLambertMaterial({ color: "#c5d0dc" }),
  );
  blade.position.set(0.22, 0.88, 0);
  axe.add(handle, blade);
  axe.position.set(0.1, -0.72, 0.18);
  axe.rotation.z = -0.45;
  axe.visible = isPlayer;
  rArm.add(axe);
  const sword = new THREE.Group();
  const sHandle = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.7, 0.08),
    new THREE.MeshLambertMaterial({ color: "#4a3422" }),
  );
  sHandle.position.y = 0.2;
  const guard = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.07, 0.1),
    new THREE.MeshLambertMaterial({ color: "#c9a227" }),
  );
  guard.position.y = 0.55;
  const sBlade = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 1.35, 0.05),
    new THREE.MeshLambertMaterial({ color: "#dce6f0" }),
  );
  sBlade.position.y = 1.22;
  sword.add(sHandle, guard, sBlade);
  sword.position.set(0.08, -0.7, 0.16);
  sword.rotation.z = -0.25;
  sword.visible = false;
  rArm.add(sword);
  torso.castShadow = true;
  root.position.set(x, 0, z);
  scene.add(root);
  const actor = {
    root,
    lArm,
    rArm,
    lLeg,
    rLeg,
    walk: 0,
    stomping: false,
    isPlayer,
    health: 100,
    maxHealth: 100,
    shield: 0,
    wood: isPlayer ? 150 : 80,
    gun: "pistol",
    guns: { pistol: true, rifle: true, shotgun: true, sword: true },
    ammo: { light: 80, medium: isPlayer ? 60 : 24, shell: isPlayer ? 16 : 6 },
    yaw: Math.random() * Math.PI * 2,
    pitch: 0,
    vy: 0,
    grounded: true,
    airJumps: 1,
    cooldown: 0,
    harvestCd: 0,
    axeSwing: 0,
    swordSwing: 0,
    axe,
    sword,
    tool,
    alive: true,
    color,
    ai: { wander: Math.random() * Math.PI * 2, next: 1 + Math.random() * 2 },
  };
  actors.push(actor);
  return actor;
}

const player = makePawn("#3d7bfd", 0, 0, true);
for (let i = 0; i < BOT_COUNT; i++) {
  const a = (i / BOT_COUNT) * Math.PI * 2 + 0.35;
  makePawn("#4ecdc4", Math.cos(a) * BOT_RING, Math.sin(a) * BOT_RING);
}

function makeBoss() {
  const root = new THREE.Group();
  const coat = new THREE.MeshLambertMaterial({ color: "#c4a06a" });
  const dark = new THREE.MeshLambertMaterial({ color: "#6a4428" });
  const belly = new THREE.MeshLambertMaterial({ color: "#f0e6d2" });
  const skin = new THREE.MeshLambertMaterial({ color: "#b88958" });
  const antler = new THREE.MeshLambertMaterial({ color: "#d7c4a2" });
  const hoof = new THREE.MeshLambertMaterial({ color: "#1a1410" });
  const nose = new THREE.MeshLambertMaterial({ color: "#14100c" });
  const eyeW = new THREE.MeshLambertMaterial({ color: "#f4efe6" });
  const eyeD = new THREE.MeshLambertMaterial({ color: "#1c120a" });
  const part = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, rz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    root.add(mesh);
    return mesh;
  };
  part(new THREE.CapsuleGeometry(2.45, 7.2, 8, 14), coat, 0, 7.1, -0.4, Math.PI / 2);
  part(new THREE.SphereGeometry(2.85, 12, 12), coat, 0, 7.35, -3.8);
  part(new THREE.SphereGeometry(2.55, 12, 12), coat, 0, 6.85, 2.6);
  part(new THREE.SphereGeometry(1.85, 12, 12), belly, 0, 5.15, 0.35);
  const leg = (x, z, hind) => {
    const hip = hind ? 6.9 : 6.45;
    part(new THREE.CylinderGeometry(hind ? 0.78 : 0.62, hind ? 0.55 : 0.48, 3.4, 10), dark, x, hip - 1.55, z, hind ? 0.18 : 0.08);
    part(new THREE.CylinderGeometry(0.38, 0.32, 2.9, 10), skin, x, 2.05, z + (hind ? 0.15 : 0.08));
    part(new THREE.BoxGeometry(0.55, 0.32, 0.78), hoof, x, 0.22, z + 0.12);
  };
  leg(1.55, 2.55, false);
  leg(-1.55, 2.55, false);
  leg(1.7, -3.45, true);
  leg(-1.7, -3.45, true);
  part(new THREE.CylinderGeometry(0.72, 1.15, 4.2, 10), coat, 0, 8.55, 4.35, 0.72);
  part(new THREE.SphereGeometry(1.45, 12, 12), coat, 0, 10.15, 6.35);
  part(new THREE.CapsuleGeometry(0.62, 1.7, 6, 10), skin, 0, 9.55, 7.85, Math.PI / 2);
  part(new THREE.SphereGeometry(0.42, 10, 10), nose, 0, 9.35, 8.85);
  part(new THREE.BoxGeometry(0.18, 1.15, 0.55), coat, 0.95, 11.05, 6.15, 0.15, 0.2, -0.85);
  part(new THREE.BoxGeometry(0.18, 1.15, 0.55), coat, -0.95, 11.05, 6.15, 0.15, -0.2, 0.85);
  part(new THREE.SphereGeometry(0.16, 8, 8), eyeW, 0.62, 10.28, 7.15);
  part(new THREE.SphereGeometry(0.16, 8, 8), eyeW, -0.62, 10.28, 7.15);
  part(new THREE.SphereGeometry(0.09, 8, 8), eyeD, 0.7, 10.3, 7.26);
  part(new THREE.SphereGeometry(0.09, 8, 8), eyeD, -0.7, 10.3, 7.26);
  const beam = (x, y, z, rx, ry, rz, h, r0 = 0.16, r1 = 0.08) =>
    part(new THREE.CylinderGeometry(r1, r0, h, 7), antler, x, y, z, rx, ry, rz);
  const rack = (s) => {
    beam(s * 0.55, 11.7, 6.15, -0.28, 0, s * 0.42, 3.8, 0.2, 0.1);
    beam(s * 0.95, 12.55, 6.85, 0.95, 0, s * 0.15, 2.1, 0.1, 0.05);
    beam(s * 1.55, 13.15, 5.85, 0.25, 0, s * 0.95, 2.4, 0.11, 0.05);
    beam(s * 1.15, 14.35, 5.55, 0.05, 0, s * 0.35, 2.0, 0.1, 0.045);
    beam(s * 1.85, 14.05, 5.35, 0.35, 0, s * 1.05, 1.7, 0.08, 0.04);
    beam(s * 0.75, 14.85, 5.95, 0.7, 0, s * 0.12, 1.45, 0.07, 0.035);
  };
  rack(1);
  rack(-1);
  part(new THREE.ConeGeometry(0.28, 1.15, 8), coat, 0, 6.55, -6.35, 2.4);
  part(new THREE.ConeGeometry(0.22, 0.7, 8), belly, 0, 6.35, -6.85, 2.5);
  root.position.set(0, 0, 0);
  scene.add(root);
  const actor = {
    root,
    isPlayer: false,
    isBoss: true,
    health: BOSS_HP,
    maxHealth: BOSS_HP,
    shield: 0,
    wood: 0,
    gun: "pistol",
    guns: { pistol: true },
    ammo: { light: 99 },
    yaw: 0,
    pitch: 0,
    vy: 0,
    grounded: true,
    airJumps: 1,
    cooldown: 0,
    smashCd: 0,
    harvestCd: 0,
    axeSwing: 0,
    swordSwing: 0,
    axe: null,
    sword: null,
    tool: null,
    alive: true,
    color: "#c4a06a",
    hitSpheres: [
      { x: 0, y: 7.1, z: 1.4, r: 4.4 },
      { x: 0, y: 7.3, z: -3.4, r: 4.0 },
      { x: 0, y: 10.1, z: 6.4, r: 2.8 },
    ],
    focus: null,
    retarget: 0,
    ai: { wander: 0, next: 0.4 },
  };
  actors.push(actor);
  return actor;
}

const boss = makeBoss();

function isAlly(actor) {
  return actor && !actor.isBoss;
}

let buildMode = "wall";
let matchTime = 0;
let playing = false;
let ended = false;
let yaw = 0;
let pitch = 0.12;
let snapCamera = true;

const SKILLS = [
  { id: "hotshot", branch: "Combat", name: "Hot Shot", desc: "+8 bullet damage", req: null, level: 1 },
  { id: "rapid", branch: "Combat", name: "Rapid Fire", desc: "Faster fire rate", req: "hotshot", level: 1 },
  { id: "headhunter", branch: "Combat", name: "Headhunter", desc: "+12 more damage", req: "rapid", level: 1 },
  { id: "overcharge", branch: "Combat", name: "Overcharge", desc: "Shots fly faster and farther", req: "headhunter", level: 2 },
  { id: "piercing", branch: "Combat", name: "Piercing", desc: "+10 damage", req: "overcharge", level: 4 },
  { id: "hollow", branch: "Combat", name: "Hollow Point", desc: "+6 damage", req: "piercing", level: 5 },
  { id: "ace", branch: "Combat", name: "Ace", desc: "+10 damage and faster fire", req: "hollow", level: 6 },
  { id: "burst", branch: "Combat", name: "Burst", desc: "+8 damage", req: "ace", level: 7 },
  { id: "marksman", branch: "Combat", name: "Marksman", desc: "Shots last longer", req: "burst", level: 8 },
  { id: "execute", branch: "Combat", name: "Execute", desc: "+10 damage", req: "marksman", level: 9 },
  { id: "stormshot", branch: "Combat", name: "Stormshot", desc: "+15 damage, fastest fire", req: "execute", level: 10 },
  { id: "woodcutter", branch: "Harvest", name: "Woodcutter", desc: "+6 wood per axe hit", req: null, level: 1 },
  { id: "keen", branch: "Harvest", name: "Keen Edge", desc: "Swing the axe faster", req: "woodcutter", level: 1 },
  { id: "forester", branch: "Harvest", name: "Forester", desc: "Felling a tree grants 1 skill point", req: "keen", level: 1 },
  { id: "splinter", branch: "Harvest", name: "Splinter", desc: "+8 more wood per hit", req: "forester", level: 2 },
  { id: "timberlord", branch: "Harvest", name: "Timberlord", desc: "Last hit on a tree pays double", req: "splinter", level: 4 },
  { id: "deeproots", branch: "Harvest", name: "Deep Roots", desc: "+6 wood per hit", req: "timberlord", level: 5 },
  { id: "orchard", branch: "Harvest", name: "Orchard", desc: "Trees grow back faster", req: "deeproots", level: 7 },
  { id: "goldwood", branch: "Harvest", name: "Goldwood", desc: "Felling a tree grants 2 skill points", req: "orchard", level: 8 },
  { id: "worldtree", branch: "Harvest", name: "World Tree", desc: "Huge wood gains, very fast swings", req: "goldwood", level: 10 },
  { id: "scavenger", branch: "Building", name: "Scavenger", desc: "+40 wood, cheaper builds", req: null, level: 1 },
  { id: "fortify", branch: "Building", name: "Fortify", desc: "Placed pieces have more HP", req: "scavenger", level: 1 },
  { id: "architect", branch: "Building", name: "Architect", desc: "Builds cost 5 wood", req: "fortify", level: 1 },
  { id: "stockpile", branch: "Building", name: "Stockpile", desc: "+80 wood each drop", req: "architect", level: 2 },
  { id: "mason", branch: "Building", name: "Master Mason", desc: "Build HP 200", req: "stockpile", level: 4 },
  { id: "recycle", branch: "Building", name: "Recycling", desc: "Refund 3 wood when you build", req: "mason", level: 5 },
  { id: "fortress", branch: "Building", name: "Fortress", desc: "Build HP 260", req: "recycle", level: 8 },
  { id: "freebuild", branch: "Building", name: "Freebuild", desc: "Builds cost 3 wood", req: "fortress", level: 9 },
  { id: "citadel", branch: "Building", name: "Citadel", desc: "Build HP 320 and +100 drop wood", req: "freebuild", level: 10 },
  { id: "thick", branch: "Survival", name: "Thick Skin", desc: "+30 max HP", req: null, level: 1 },
  { id: "walker", branch: "Survival", name: "Storm Walker", desc: "Take half storm damage", req: "thick", level: 1 },
  { id: "second", branch: "Survival", name: "Second Wind", desc: "Regen 4 HP/s under 50%", req: "walker", level: 1 },
  { id: "iron", branch: "Survival", name: "Iron Lungs", desc: "Higher jump", req: "second", level: 2 },
  { id: "aegis", branch: "Survival", name: "Aegis", desc: "+40 max HP", req: "iron", level: 4 },
  { id: "vitals", branch: "Survival", name: "Vitals", desc: "Regen 2 HP/s always", req: "aegis", level: 5 },
  { id: "crown", branch: "Survival", name: "Storm Crown", desc: "Slowly heal inside the circle", req: "vitals", level: 6 },
  { id: "reserve", branch: "Survival", name: "Reserve", desc: "+25 max HP", req: "crown", level: 7 },
  { id: "stormborn", branch: "Survival", name: "Stormborn", desc: "More heal inside the circle", req: "reserve", level: 8 },
  { id: "colossus", branch: "Survival", name: "Colossus", desc: "+50 max HP", req: "stormborn", level: 9 },
  { id: "immortal", branch: "Survival", name: "Immortal", desc: "Strong constant regen", req: "colossus", level: 10 },
  { id: "swift", branch: "Mobility", name: "Swift", desc: "+15% move speed", req: null, level: 3 },
  { id: "double", branch: "Mobility", name: "Double Time", desc: "+15% more speed", req: "swift", level: 3 },
  { id: "skystep", branch: "Mobility", name: "Sky Step", desc: "Even higher jump", req: "double", level: 3 },
  { id: "legend", branch: "Mobility", name: "Storm Dash", desc: "Move faster inside the circle", req: "skystep", level: 6 },
  { id: "lightfoot", branch: "Mobility", name: "Lightfoot", desc: "+10% move speed", req: "legend", level: 7 },
  { id: "gale", branch: "Mobility", name: "Gale", desc: "Higher jump and a bit more speed", req: "lightfoot", level: 9 },
  { id: "blink", branch: "Mobility", name: "Blink", desc: "+20% move speed", req: "gale", level: 10 },
];

const MAX_LEVEL = 100;
const BRANCHES = ["Combat", "Harvest", "Building", "Survival", "Mobility"];
const DECADES = [20, 30, 40, 50, 60, 70, 80, 90, 100];
const MILESTONE_REQ = {
  Combat: "stormshot",
  Harvest: "worldtree",
  Building: "citadel",
  Survival: "immortal",
  Mobility: "blink",
};
const MILESTONE_NAMES = {
  Combat: ["Veteran", "Elite", "Champion", "Warlord", "Mythic", "Ascendant", "Celestial", "Eternal", "Godshot"],
  Harvest: ["Sawyer", "Ranger", "Logger", "Grove", "Canopy", "Wildwood", "Heartwood", "Yggdrasil", "Worldroot"],
  Building: ["Carpenter", "Masonry", "Bastion", "Keep", "Palace", "Stronghold", "Metropolis", "Aegis Wall", "Skyfort"],
  Survival: ["Hardy", "Stalwart", "Bulwark", "Titan", "Undying", "Phoenix", "Primordial", "Ageless", "Deathless"],
  Mobility: ["Runner", "Scout", "Courser", "Galeborn", "Slipstream", "Afterimage", "Quantum", "Voidstep", "Omnisprint"],
};

DECADES.forEach((lv, i) => {
  for (const branch of BRANCHES) {
    const prev = i === 0 ? MILESTONE_REQ[branch] : `ms-${branch}-${DECADES[i - 1]}`;
    SKILLS.push({
      id: `ms-${branch}-${lv}`,
      branch,
      name: `${MILESTONE_NAMES[branch][i]}`,
      desc: `Level ${lv} milestone — stronger ${branch.toLowerCase()}.`,
      req: prev,
      level: lv,
    });
  }
});

const SAVE_KEY = "storm-royale-progress";
const unlocked = new Set();
const mastery = { Combat: 0, Harvest: 0, Building: 0, Survival: 0, Mobility: 0 };
let skillPoints = 2;
let wins = 0;
let xp = 0;
let career = { kills: 0, matches: 0 };
let matchStats = { kills: 0, wood: 0, chests: 0 };
let mouseSens = 0.0022;
let soundOn = true;
let skillsOpen = false;
let resumeAfterSkills = false;
let lastStormCue = "";

function loadProgress() {
  try {
    const data = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
    wins = Number(data.wins) || 0;
    xp = Number(data.xp) || 0;
    skillPoints = Number.isFinite(data.skillPoints) ? data.skillPoints : 2;
    career = { kills: Number(data.career?.kills) || 0, matches: Number(data.career?.matches) || 0 };
    mouseSens = Number(data.mouseSens) || 0.0022;
    soundOn = data.soundOn !== false;
    for (const id of data.unlocked || []) unlocked.add(id);
    if (data.mastery) {
      for (const branch of BRANCHES) mastery[branch] = Number(data.mastery[branch]) || 0;
    }
  } catch {
    wins = 0;
  }
}

function saveProgress() {
  localStorage.setItem(
    SAVE_KEY,
    JSON.stringify({ wins, xp, skillPoints, unlocked: [...unlocked], mastery, career, mouseSens, soundOn }),
  );
}

function xpToNext(level) {
  return Math.round(18 + level * 3.5);
}

function xpLevel() {
  let level = 1;
  let remaining = xp;
  while (level < MAX_LEVEL) {
    const need = xpToNext(level);
    if (remaining < need) break;
    remaining -= need;
    level += 1;
  }
  return { level, into: remaining, need: xpToNext(Math.min(level, MAX_LEVEL)) };
}

function playerLevel() {
  return Math.min(MAX_LEVEL, Math.max(xpLevel().level, wins + 1));
}

function maxMastery() {
  return Math.max(0, playerLevel() - 10);
}

function addXp(amount) {
  if (!amount) return;
  const before = playerLevel();
  xp += amount;
  const after = playerLevel();
  if (after > before) {
    skillPoints += after - before;
    beep(640, 0.12, "triangle", 0.05);
  }
  saveProgress();
  renderSkills();
}

function visibleSkills() {
  const level = playerLevel();
  return SKILLS.filter((s) => (s.level || 1) <= level);
}

function nextTreeAt() {
  const level = playerLevel();
  const locked = SKILLS.filter((s) => (s.level || 1) > level);
  if (!locked.length) return null;
  return Math.min(...locked.map((s) => s.level));
}

function milestoneCount(branch) {
  return DECADES.filter((lv) => unlocked.has(`ms-${branch}-${lv}`)).length;
}

function playerStats() {
  const inside = inStorm(player.root.position.x, player.root.position.z);
  let speed = 11;
  if (unlocked.has("swift")) speed *= 1.15;
  if (unlocked.has("double")) speed *= 1.15;
  if (unlocked.has("legend") && inside) speed *= 1.22;
  if (unlocked.has("lightfoot")) speed *= 1.1;
  if (unlocked.has("gale")) speed *= 1.08;
  if (unlocked.has("blink")) speed *= 1.2;
  speed *= 1 + mastery.Mobility * 0.004 + milestoneCount("Mobility") * 0.03;
  let cooldown = 0.18;
  if (unlocked.has("rapid")) cooldown = 0.11;
  if (unlocked.has("ace")) cooldown = 0.08;
  if (unlocked.has("stormshot")) cooldown = 0.07;
  let woodCost = 10;
  if (unlocked.has("scavenger")) woodCost = 7;
  if (unlocked.has("architect")) woodCost = 5;
  if (unlocked.has("freebuild") || unlocked.has("citadel")) woodCost = 3;
  let buildHp = 80;
  if (unlocked.has("fortify")) buildHp = 140;
  if (unlocked.has("mason")) buildHp = 200;
  if (unlocked.has("fortress")) buildHp = 260;
  if (unlocked.has("citadel")) buildHp = 320;
  return {
    dmg:
      24 +
      (unlocked.has("hotshot") ? 8 : 0) +
      (unlocked.has("headhunter") ? 12 : 0) +
      (unlocked.has("piercing") ? 10 : 0) +
      (unlocked.has("hollow") ? 6 : 0) +
      (unlocked.has("ace") ? 10 : 0) +
      (unlocked.has("burst") ? 8 : 0) +
      (unlocked.has("execute") ? 10 : 0) +
      (unlocked.has("stormshot") ? 15 : 0) +
      mastery.Combat * 0.5 +
      milestoneCount("Combat") * 6,
    cooldown,
    speed,
    jump: 9 + (unlocked.has("iron") ? 2.4 : 0) + (unlocked.has("skystep") ? 2.2 : 0) + (unlocked.has("gale") ? 2 : 0) + milestoneCount("Mobility") * 0.4,
    projSpeed: 48 + (unlocked.has("overcharge") ? 20 : 0),
    projLife: 1.1 + (unlocked.has("overcharge") ? 0.4 : 0) + (unlocked.has("marksman") ? 0.5 : 0),
    woodCost,
    buildHp: buildHp + mastery.Building * 1 + milestoneCount("Building") * 12,
    maxHealth:
      100 +
      (unlocked.has("thick") ? 30 : 0) +
      (unlocked.has("aegis") ? 40 : 0) +
      (unlocked.has("reserve") ? 25 : 0) +
      (unlocked.has("colossus") ? 50 : 0) +
      (unlocked.has("immortal") ? 30 : 0) +
      mastery.Survival +
      milestoneCount("Survival") * 8,
    stormMult: unlocked.has("walker") ? 0.45 : 1,
    regen: unlocked.has("second") ? 4 : 0,
    regenAlways: (unlocked.has("vitals") ? 2 : 0) + (unlocked.has("immortal") ? 6 : 0) + mastery.Survival * 0.02,
    circleHeal: (unlocked.has("crown") ? 3 : 0) + (unlocked.has("stormborn") ? 3 : 0),
    startWood: 150 + (unlocked.has("scavenger") ? 40 : 0) + (unlocked.has("stockpile") ? 80 : 0) + (unlocked.has("citadel") ? 100 : 0) + mastery.Building * 2 + milestoneCount("Building") * 20,
    chopWood:
      8 +
      (unlocked.has("woodcutter") ? 6 : 0) +
      (unlocked.has("splinter") ? 8 : 0) +
      (unlocked.has("deeproots") ? 6 : 0) +
      (unlocked.has("worldtree") ? 15 : 0) +
      mastery.Harvest * 0.4 +
      milestoneCount("Harvest") * 4,
    harvestCd: unlocked.has("worldtree") ? 0.2 : unlocked.has("keen") ? 0.28 : 0.45,
    fellSp: unlocked.has("goldwood") ? 2 : unlocked.has("forester") ? 1 : 0,
    lastHitMult: unlocked.has("timberlord") ? 2 : 1,
    treeRespawn: unlocked.has("orchard") ? 10 : 18,
    buildRefund: unlocked.has("recycle") ? 3 : 0,
  };
}

function renderSkills() {
  spText.textContent = skillPoints;
  winsText.textContent = String(wins);
  levelText.textContent = String(playerLevel());
  const info = xpLevel();
  skillPointsEl.textContent = `${skillPoints} SP · Lv ${playerLevel()}/${MAX_LEVEL} · ${wins} win${wins === 1 ? "" : "s"}`;
  const next = nextTreeAt();
  const xpHint = playerLevel() >= MAX_LEVEL ? "Max level." : `XP ${Math.floor(info.into)}/${info.need} to next level.`;
  skillHelpEl.textContent = next
    ? `Level ${playerLevel()}/${MAX_LEVEL}. Named nodes at 20/30/…/100. After 10, buy Mastery ranks. ${xpHint}`
    : `Level ${playerLevel()}/${MAX_LEVEL}. Tree milestones complete — keep buying Mastery ranks. ${xpHint}`;
  const shown = visibleSkills();
  const branches = [...new Set(shown.map((s) => s.branch))];
  skillBranches.innerHTML = "";
  for (const name of branches) {
    const col = document.createElement("div");
    col.className = "branch";
    col.innerHTML = `<h3>${name.toUpperCase()}</h3>`;
    for (const skill of shown.filter((s) => s.branch === name)) {
      const owned = unlocked.has(skill.id);
      const reqOk = !skill.req || unlocked.has(skill.req);
      const available = !owned && reqOk && skillPoints > 0;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `skill-node ${owned ? "owned" : available ? "available" : "locked"}`;
      btn.innerHTML = `<strong>${skill.name}</strong><small>${skill.desc}</small>`;
      btn.disabled = !available;
      btn.addEventListener("click", () => unlockSkill(skill.id));
      col.append(btn);
    }
    const cap = maxMastery();
    const rank = mastery[name] || 0;
    const masterBtn = document.createElement("button");
    masterBtn.type = "button";
    masterBtn.className = `skill-node ${rank < cap && skillPoints > 0 ? "available" : rank > 0 ? "owned" : "locked"}`;
    masterBtn.innerHTML = `<strong>Mastery ${rank}/${cap}</strong><small>Spend 1 SP per rank after level 10. Caps at level − 10.</small>`;
    masterBtn.disabled = !(rank < cap && skillPoints > 0);
    masterBtn.addEventListener("click", () => buyMastery(name));
    col.append(masterBtn);
    skillBranches.append(col);
  }
}

function buyMastery(branch) {
  if (skillPoints < 1 || mastery[branch] >= maxMastery()) return;
  skillPoints -= 1;
  mastery[branch] += 1;
  const stats = playerStats();
  player.maxHealth = stats.maxHealth;
  beep(500, 0.08, "triangle", 0.04);
  saveProgress();
  renderSkills();
}

function unlockSkill(id) {
  const skill = SKILLS.find((s) => s.id === id);
  if (!skill || unlocked.has(id) || skillPoints < 1) return;
  if ((skill.level || 1) > playerLevel()) return;
  if (skill.req && !unlocked.has(skill.req)) return;
  skillPoints -= 1;
  unlocked.add(id);
  const stats = playerStats();
  player.maxHealth = stats.maxHealth;
  const hpGain = { thick: 30, aegis: 40, reserve: 25, colossus: 50, immortal: 30 }[id];
  if (hpGain) player.health = Math.min(stats.maxHealth, player.health + hpGain);
  if (id === "scavenger") player.wood += 40;
  if (id === "stockpile") player.wood += 80;
  beep(520, 0.1, "triangle", 0.05);
  saveProgress();
  renderSkills();
}

function openSkills() {
  skillsOpen = true;
  resumeAfterSkills = playing && !ended;
  if (playing) playing = false;
  skillTreeEl.classList.add("show");
  renderSkills();
  if (document.pointerLockElement) document.exitPointerLock();
}

function closeSkills() {
  skillTreeEl.classList.remove("show");
  const shouldResume = resumeAfterSkills && !ended && !paused && player.alive;
  skillsOpen = false;
  resumeAfterSkills = false;
  if (shouldResume) {
    playing = true;
    renderer.domElement.requestPointerLock();
  }
}

function setMode(mode) {
  buildMode = mode;
  slots.forEach((slot) => slot.classList.toggle("active", slot.dataset.mode === mode));
}

function beep(freq, dur = 0.08, type = "square", vol = 0.04) {
  if (!soundOn) return;
  const ctx = beep.ctx || (beep.ctx = new AudioContext());
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = vol;
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + dur);
}

function showPanel(name) {
  overlay.classList.add("show");
  for (const [key, el] of Object.entries(panels)) el.classList.toggle("hidden", key !== name);
}

function hideOverlay() {
  overlay.classList.remove("show");
  for (const el of Object.values(panels)) el.classList.add("hidden");
}

function updateCareerLine() {
  const map = currentMap();
  const next = MAPS[(wins + 1) % MAPS.length];
  careerLine.textContent = `${wins} wins · ${career.kills} career elims · Lv ${playerLevel()} · Drop: ${map.name}${wins % 5 === 4 ? " · next win returns to Grass Isle" : ` · next: ${next.name}`}`;
}

function flashBanner(text) {
  bannerEl.textContent = text;
  bannerEl.classList.add("show");
  clearTimeout(flashBanner.t);
  flashBanner.t = setTimeout(() => bannerEl.classList.remove("show"), 2800);
}

function pushFeed(text) {
  const row = document.createElement("div");
  row.textContent = text;
  killfeedEl.prepend(row);
  while (killfeedEl.children.length > 5) killfeedEl.lastChild.remove();
}

function setGun(id) {
  if (!player.guns[id]) return;
  player.gun = id;
  if (player.sword) player.sword.visible = id === "sword";
  if (player.axe) player.axe.visible = id !== "sword";
  if (player.tool) player.tool.visible = id !== "sword";
  document.querySelectorAll(".wslot[data-gun]").forEach((el) => {
    el.classList.toggle("on", el.dataset.gun === id);
    el.classList.toggle("off", el.dataset.gun !== "sword" && !player.guns[el.dataset.gun]);
  });
}

function grantLoot(kind) {
  if (kind === "rifle") {
    player.guns.rifle = true;
    player.ammo.medium += 30;
    setGun("rifle");
    flashBanner("Tactical Rifle");
  } else if (kind === "shotgun") {
    player.guns.shotgun = true;
    player.ammo.shell += 8;
    setGun("shotgun");
    flashBanner("Pump Shotgun");
  } else if (kind === "med") {
    player.health = Math.min(player.maxHealth, player.health + 40);
    flashBanner("Medkit +40 HP");
  } else if (kind === "shield") {
    player.shield = Math.min(100, player.shield + 50);
    flashBanner("Shield +50");
  } else {
    player.wood += 40;
    player.ammo.light += 20;
    flashBanner("Wood + ammo");
  }
  beep(500, 0.08, "triangle");
}

function tryLoot() {
  if (!playing || !player.alive) return;
  const p = player.root.position;
  for (const chest of chests) {
    if (chest.open) continue;
    if (Math.hypot(chest.x - p.x, chest.z - p.z) > 3.4) continue;
    chest.open = true;
    chest.crate.material.color.set("#6d5a32");
    chest.beacon.visible = false;
    chest.gem.visible = false;
    matchStats.chests += 1;
    const roll = Math.random();
    grantLoot(roll < 0.28 ? "rifle" : roll < 0.48 ? "shotgun" : roll < 0.7 ? "shield" : roll < 0.86 ? "med" : "pack");
    return;
  }
}

function stormRadius() {
  return STORM_START;
}

function inStorm(x, z) {
  return Math.hypot(x, z) <= stormRadius();
}

function livingNpcs() {
  return actors.filter((a) => a.alive && !a.isPlayer);
}

function npcsAlive() {
  return livingNpcs().length > 0;
}

function lavaOn() {
  return matchTime > LAVA_DELAY && npcsAlive();
}

function onLavaFloor(actor) {
  return actor.root.position.y <= 0.15;
}

function nearestLandmark(actor) {
  let best = null;
  let bestDist = Infinity;
  for (const mesh of landmarkMeshes) {
    const dist = Math.hypot(mesh.position.x - actor.root.position.x, mesh.position.z - actor.root.position.z);
    if (dist < bestDist) {
      best = mesh;
      bestDist = dist;
    }
  }
  return best;
}

function updateLavaLook() {
  const theme = currentMap();
  if (!lavaOn()) {
    island.material.color.set(theme.ground);
    island.material.emissive.set("#000000");
    water.material.color.set(theme.water);
    return;
  }
  const pulse = 0.55 + 0.45 * Math.sin(matchTime * 5);
  island.material.color.setRGB(0.72, 0.16 + 0.08 * pulse, 0.04);
  island.material.emissive.setRGB(0.35 * pulse, 0.05, 0);
  water.material.color.setRGB(0.45, 0.08, 0.03);
}

function placeBuild(actor) {
  const cost = actor.isPlayer ? playerStats().woodCost : 10;
  if (!actor.alive || actor.wood < cost) return;
  const dir = new THREE.Vector3(Math.sin(actor.yaw), 0, Math.cos(actor.yaw));
  const target = actor.root.position.clone().addScaledVector(dir, 3.2);
  const gx = gridSnap(target.x);
  const gz = gridSnap(target.z);
  const key = `${buildMode}:${gx}:${gz}`;
  if (builds.some((b) => b.userData.key === key)) return;

  let mesh;
  if (buildMode === "wall") {
    mesh = new THREE.Mesh(
      new THREE.BoxGeometry(CELL, 4, 0.35),
      new THREE.MeshLambertMaterial({ color: "#c9854a" })
    );
    mesh.position.set(gx, 2, gz);
    mesh.rotation.y = Math.round(actor.yaw / (Math.PI / 2)) * (Math.PI / 2);
  } else if (buildMode === "floor") {
    mesh = new THREE.Mesh(
      new THREE.BoxGeometry(CELL, 0.28, CELL),
      new THREE.MeshLambertMaterial({ color: "#d9a066" })
    );
    mesh.position.set(gx, 0.2, gz);
  } else {
    mesh = new THREE.Mesh(
      new THREE.BoxGeometry(CELL, 0.28, CELL * 1.35),
      new THREE.MeshLambertMaterial({ color: "#e0a45a" })
    );
    mesh.position.set(gx, 2, gz);
    mesh.rotation.x = -Math.PI / 5;
    mesh.rotation.y = Math.round(actor.yaw / (Math.PI / 2)) * (Math.PI / 2);
  }
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = { key, hp: actor.isPlayer ? playerStats().buildHp : 80 };
  scene.add(mesh);
  builds.push(mesh);
  actor.wood -= cost;
  if (actor.isPlayer && playerStats().buildRefund) actor.wood += playerStats().buildRefund;
  beep(320, 0.06, "triangle");
}

function facingTree(actor, maxDist = 3.8) {
  const forward = new THREE.Vector3(Math.sin(actor.yaw), 0, Math.cos(actor.yaw));
  let best = null;
  let bestScore = maxDist;
  for (const tree of trees) {
    if (tree.dead) continue;
    const to = new THREE.Vector3(tree.x - actor.root.position.x, 0, tree.z - actor.root.position.z);
    const dist = to.length();
    if (dist > maxDist) continue;
    if (dist > 0.001 && to.normalize().dot(forward) < 0.35) continue;
    if (dist < bestScore) {
      best = tree;
      bestScore = dist;
    }
  }
  return best;
}

function facingFoe(actor, maxDist = 3.1) {
  const forward = new THREE.Vector3(Math.sin(actor.yaw), 0, Math.cos(actor.yaw));
  let best = null;
  let bestScore = 99;
  for (const other of actors) {
    if (other === actor || !other.alive) continue;
    if (isAlly(actor) === isAlly(other)) continue;
    const to = new THREE.Vector3(
      other.root.position.x - actor.root.position.x,
      0,
      other.root.position.z - actor.root.position.z,
    );
    const dist = to.length();
    const reach = other.isBoss ? 8.5 : maxDist;
    if (dist > reach) continue;
    if (dist > 0.001 && to.normalize().dot(forward) < 0.15) continue;
    if (dist < bestScore) {
      best = other;
      bestScore = dist;
    }
  }
  return best;
}

function swingSword(actor) {
  if (!actor.alive || actor.cooldown > 0) return;
  actor.cooldown = actor.isPlayer ? 0.4 : 0.7;
  actor.swordSwing = 0.2;
  beep(200, 0.08, "sawtooth", 0.04);
  const foe = facingFoe(actor);
  if (!foe) return;
  const dmg = actor.isPlayer ? 42 + mastery.Combat * 0.4 : 16;
  damage(foe, dmg, actor);
  beep(360, 0.06, "square", 0.04);
}

function swingAxe(actor) {
  if (!actor.alive || !actor.isPlayer || actor.harvestCd > 0) return;
  const stats = playerStats();
  actor.harvestCd = stats.harvestCd;
  actor.axeSwing = 0.22;
  beep(240, 0.06, "sawtooth", 0.035);
  const tree = facingTree(actor);
  if (!tree) return;
  tree.hp -= 12;
  let gain = stats.chopWood;
  if (tree.hp <= 0) {
    gain *= stats.lastHitMult;
    gain += 18;
    tree.hp = 0;
    tree.dead = true;
    tree.respawn = stats.treeRespawn;
    tree.group.visible = false;
    if (stats.fellSp) skillPoints += stats.fellSp;
    addXp(12);
    beep(180, 0.12, "triangle", 0.05);
  }
    actor.wood += Math.round(gain);
    if (actor.isPlayer) matchStats.wood += gain;
}

function updateTrees(dt) {
  for (const tree of trees) {
    if (!tree.dead) continue;
    tree.respawn -= dt;
    if (tree.respawn <= 0) {
      tree.dead = false;
      tree.hp = tree.maxHp;
      tree.group.visible = true;
    }
  }
}

function shoot(actor) {
  if (!actor.alive || actor.cooldown > 0) return;
  if (actor.gun === "sword") {
    swingSword(actor);
    return;
  }
  const gun = GUNS[actor.gun] || GUNS.pistol;
  const stats = actor.isPlayer ? playerStats() : { cooldown: 0.85, projLife: 1.1, projSpeed: 48, dmg: 8 };
  actor.cooldown = (actor.isPlayer ? stats.cooldown : 0.85) * gun.cd;
  const origin = actor.root.position.clone().add(new THREE.Vector3(0, 1.5, 0));
  const pellets = actor.gun === "shotgun" ? 3 : 1;
  for (let i = 0; i < pellets; i++) {
    const dir = new THREE.Vector3(
      Math.sin(actor.yaw) * Math.cos(actor.pitch),
      -Math.sin(actor.pitch),
      Math.cos(actor.yaw) * Math.cos(actor.pitch)
    ).normalize();
    if (pellets > 1) {
      dir.x += (Math.random() - 0.5) * 0.18;
      dir.y += (Math.random() - 0.5) * 0.08;
      dir.z += (Math.random() - 0.5) * 0.18;
      dir.normalize();
    }
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 8, 8),
      new THREE.MeshBasicMaterial({ color: actor.isPlayer ? gun.color : "#ffd166" })
    );
    ball.position.copy(origin);
    scene.add(ball);
    projectiles.push({
      mesh: ball,
      dir,
      life: stats.projLife * (actor.gun === "shotgun" ? 0.55 : 1),
      speed: stats.projSpeed,
      owner: actor,
      dmg: (actor.isPlayer ? stats.dmg : 8) * gun.dmg / pellets,
    });
  }
  beep(actor.isPlayer ? 780 : 420, 0.05);
}

function damage(actor, amount, source = null, opts = {}) {
  if (!actor.alive) return;
  if (source && isAlly(source) && isAlly(actor)) return;
  if (actor.isBoss) amount *= 0.62;
  let left = amount;
  if (!opts.bypassShield && actor.shield > 0) {
    const soak = Math.min(actor.shield, left);
    actor.shield -= soak;
    left -= soak;
  }
  actor.health = Math.max(0, actor.health - left);
  if (actor.health <= 0) {
    actor.alive = false;
    actor.root.visible = false;
    beep(90, 0.2, "sawtooth", 0.05);
    const who = source?.isPlayer ? "You" : source?.isBoss ? "The Stag" : "Ally";
    const victim = actor.isPlayer ? "you" : actor.isBoss ? "the Stag" : "an ally";
    pushFeed(opts.cause || `${who} eliminated ${victim}`);
    if (source?.isPlayer && actor.isBoss) {
      matchStats.kills += 1;
      career.kills += 1;
      skillPoints += 3;
      addXp(80);
    } else if (source?.isPlayer && !actor.isPlayer && !actor.isBoss) {
      matchStats.kills += 1;
      career.kills += 1;
      skillPoints += 1;
      if (unlocked.has("scavenger")) player.wood += 20;
      addXp(28);
    }
    if (actor.isBoss) {
      flashBanner("THE STAG IS DOWN — keep going");
      return;
    }
    if (actor.isPlayer) endMatch(false);
  }
}

let paused = false;

function pauseMatch() {
  if (ended) return;
  if (skillsOpen) {
    resumeAfterSkills = false;
    closeSkills();
  }
  if (!playing) return;
  playing = false;
  paused = true;
  showPanel("pause");
  if (document.pointerLockElement) document.exitPointerLock();
}

function resumeMatch() {
  if (!paused || ended) return;
  resumeAfterSkills = false;
  skillsOpen = false;
  skillTreeEl.classList.remove("show");
  paused = false;
  playing = true;
  hideOverlay();
  renderer.domElement.requestPointerLock();
}

function endMatch(won) {
  if (ended) return;
  ended = true;
  playing = false;
  paused = false;
  resumeAfterSkills = false;
  closeSkills();
  document.exitPointerLock();
  career.matches += 1;
  if (won) {
    wins += 1;
    skillPoints += 2;
    addXp(120);
  }
  saveProgress();
  updateCareerLine();
  document.getElementById("results-eyebrow").textContent = won ? "VICTORY" : "DEFEAT";
  document.getElementById("results-title").textContent = won ? "VICTORY" : "ELIMINATED";
  const remaining = actors.filter((a) => a.alive && !a.isBoss).length;
  document.getElementById("results-blurb").textContent = won
    ? `You survived. Level ${playerLevel()}/${MAX_LEVEL}.`
    : `${remaining} allies still fighting. Level ${playerLevel()}/${MAX_LEVEL}.`;
  document.getElementById("results-stats").innerHTML = `
    <li>Eliminations: ${matchStats.kills}</li>
    <li>Chests looted: ${matchStats.chests}</li>
    <li>Wood banked: ${Math.round(matchStats.wood)}</li>
    <li>Career: ${wins} wins · ${career.kills} elims</li>
  `;
  hud.classList.add("hidden");
  showPanel("results");
}

function resetMatch() {
  matchTime = 0;
  ended = false;
  paused = false;
  playing = true;
  lastStormCue = "";
  matchStats = { kills: 0, wood: 0, chests: 0 };
  yaw = 0;
  pitch = 0.12;
  snapCamera = true;
  killfeedEl.innerHTML = "";
  hud.classList.remove("hidden");
  hideOverlay();
  for (const p of projectiles) scene.remove(p.mesh);
  projectiles.length = 0;
  for (const b of builds) scene.remove(b);
  builds.length = 0;
  const stats = playerStats();
  const dropA = Math.random() * Math.PI * 2;
  player.root.position.set(Math.cos(dropA) * 24, 0, Math.sin(dropA) * 24);
  player.maxHealth = stats.maxHealth;
  player.health = stats.maxHealth;
  player.shield = 0;
  player.wood = stats.startWood;
  player.gun = "pistol";
  player.guns = { pistol: true, rifle: true, shotgun: true, sword: true };
  player.ammo = { light: 80, medium: 60, shell: 16 };
  setGun("pistol");
  const map = currentMap();
  applyMap(map);
  addChest(player.root.position.x + 4.2, player.root.position.z + 1.5);
  addChest(player.root.position.x - 3.2, player.root.position.z + 4.5);
  renderSkills();
  flashBanner(`${map.name} — TEAM UP. Take down the Stag`);
  player.alive = true;
  player.root.visible = true;
  player.vy = 0;
  player.stomping = false;
  player.cooldown = 0;
  player.harvestCd = 0;
  player.axeSwing = 0;
  boss.health = BOSS_HP;
  boss.maxHealth = BOSS_HP;
  boss.alive = true;
  boss.root.visible = true;
  boss.root.position.set(0, 0, 0);
  boss.vy = 0;
  boss.yaw = 0;
  boss.pitch = 0;
  boss.focus = null;
  boss.retarget = 0;
  boss.cooldown = 0;
  boss.smashCd = 0;
  boss.root.rotation.set(0, 0, 0);
  const bots = actors.filter((a) => !a.isPlayer && !a.isBoss);
  bots.forEach((bot, i) => {
    const a = (i / bots.length) * Math.PI * 2 + 0.35;
    bot.root.position.set(Math.cos(a) * BOT_RING, 0, Math.sin(a) * BOT_RING);
    bot.health = 100;
    bot.shield = Math.random() < 0.4 ? 40 : 0;
    bot.wood = 80;
    bot.alive = true;
    bot.root.visible = true;
    bot.cooldown = 0;
    bot.guns = { pistol: true, rifle: Math.random() < 0.4, shotgun: Math.random() < 0.22 };
    bot.gun = bot.guns.shotgun ? "shotgun" : bot.guns.rifle ? "rifle" : "pistol";
    bot.ammo = { light: 80, medium: 40, shell: 10 };
  });
}

function collideSolids(actor, radius = 0.55) {
  const pos = actor.root.position;
  const SNAP = 1.25;
  actor.grounded = false;
  if (pos.y <= 0) {
    pos.y = 0;
    actor.vy = 0;
    actor.grounded = true;
    actor.airJumps = 1;
  }
  if (actor.isBoss) return;

  const solids = landmarkSolids.concat(builds);
  for (const mesh of solids) {
    const box = new THREE.Box3().setFromObject(mesh);
    const onTop =
      pos.x >= box.min.x &&
      pos.x <= box.max.x &&
      pos.z >= box.min.z &&
      pos.z <= box.max.z;
    const top = box.max.y;
    const near =
      pos.x >= box.min.x - 0.7 &&
      pos.x <= box.max.x + 0.7 &&
      pos.z >= box.min.z - 0.7 &&
      pos.z <= box.max.z + 0.7;
    if (!actor.isBoss && actor.vy > 0 && near && pos.y > 0.35 && pos.y < top - 0.05) {
      pos.y = top;
      actor.vy = 0;
      actor.grounded = true;
      actor.airJumps = 1;
      continue;
    }
    if (!actor.isBoss && actor.vy <= 0 && onTop && pos.y <= top + SNAP && pos.y >= top - 0.2) {
      pos.y = top;
      actor.vy = 0;
      actor.grounded = true;
      actor.airJumps = 1;
      continue;
    }
    if (pos.y >= top - 0.05) continue;
    const closest = pos.clone().clamp(box.min, box.max);
    const dist = pos.distanceTo(closest);
    if (dist < radius) {
      const push = pos.clone().sub(closest);
      push.y = 0;
      if (push.lengthSq() === 0) {
        const left = pos.x - box.min.x;
        const right = box.max.x - pos.x;
        const back = pos.z - box.min.z;
        const fwd = box.max.z - pos.z;
        const m = Math.min(left, right, back, fwd);
        if (m === left) push.set(-1, 0, 0);
        else if (m === right) push.set(1, 0, 0);
        else if (m === back) push.set(0, 0, -1);
        else push.set(0, 0, 1);
      }
      push.setLength(radius - dist + 0.02);
      pos.x += push.x;
      pos.z += push.z;
    }
  }
}

function moveActor(actor, dx, dz, dt) {
  const speed = actor.isBoss ? 3.6 : actor.isPlayer ? playerStats().speed : 7;
  actor.root.position.x += dx * speed * dt;
  actor.root.position.z += dz * speed * dt;
  const r = Math.hypot(actor.root.position.x, actor.root.position.z);
  const maxR = STORM_START + 8;
  if (r > maxR) {
    actor.root.position.x *= maxR / r;
    actor.root.position.z *= maxR / r;
  }
  actor.vy -= (actor.stomping ? 70 : 28) * dt;
  actor.root.position.y += actor.vy * dt;
  collideSolids(actor);
  actor.root.rotation.y = actor.yaw;
  if (actor.stomping && actor.grounded) {
    actor.stomping = false;
    stompImpact(actor);
  }
  if (actor.lLeg && actor.rLeg) {
    if (actor.stomping) {
      actor.lLeg.rotation.x = 0.35;
      actor.rLeg.rotation.x = 0.35;
      actor.lArm.rotation.x = 0.8;
      actor.rArm.rotation.x = 0.8;
    } else {
      const moving = Math.hypot(dx, dz) > 0.05 && actor.grounded;
      actor.walk = (actor.walk || 0) + (moving ? dt * 9.5 : 0);
      const amp = moving ? 0.85 : 0;
      if (!moving) actor.walk *= 0.86;
      const swing = Math.sin(actor.walk) * amp;
      actor.lLeg.rotation.x = swing;
      actor.rLeg.rotation.x = -swing;
      actor.lArm.rotation.x = -swing * 0.7;
      const busy = (actor.axeSwing || 0) > 0 || (actor.swordSwing || 0) > 0;
      actor.rArm.rotation.x = busy ? -1.05 : swing * 0.7;
    }
  }
}

function stompImpact(actor) {
  beep(90, 0.16, "square", 0.06);
  const pos = actor.root.position;
  for (const other of actors) {
    if (other === actor || !other.alive) continue;
    const dist = other.root.position.distanceTo(pos);
    const reach = other.isBoss ? 10 : 4.5;
    if (dist < reach) {
      const dmg = other.isBoss ? 70 : 32;
      damage(other, dmg, actor, { cause: other.isBoss ? "You stomped the Stag" : undefined });
    }
  }
}

function updatePlayer(dt) {
  let x = 0;
  let z = 0;
  if (keys.has("KeyW") || keys.has("ArrowUp")) z += 1;
  if (keys.has("KeyS") || keys.has("ArrowDown")) z -= 1;
  if (keys.has("KeyA") || keys.has("ArrowLeft")) x -= 1;
  if (keys.has("KeyD") || keys.has("ArrowRight")) x += 1;
  const len = Math.hypot(x, z) || 1;
  x /= len;
  z /= len;
  const fx = Math.sin(yaw) * z + Math.cos(yaw) * x;
  const fz = Math.cos(yaw) * z - Math.sin(yaw) * x;
  player.yaw = yaw;
  player.pitch = pitch;
  if (justSpace) {
    if (player.grounded) {
      player.vy = playerStats().jump;
      player.grounded = false;
    } else if (player.airJumps > 0) {
      player.vy = playerStats().jump;
      player.airJumps = 0;
    }
    justSpace = false;
  }
  if (justStomp) {
    if (!player.grounded && !player.stomping && player.root.position.y > 0.4) {
      player.stomping = true;
      player.vy = -36;
      beep(140, 0.08, "sawtooth", 0.04);
    }
    justStomp = false;
  }
  if (keys.has("KeyG")) shoot(player);
  if (keys.has("KeyE")) swingAxe(player);
  moveActor(player, fx, fz, dt);
  if (player.axe) {
    const swing = player.axeSwing > 0 ? -1.15 : 0;
    player.axe.rotation.x = THREE.MathUtils.lerp(player.axe.rotation.x, swing, 0.35);
  }
  if (player.sword) {
    const slash = player.swordSwing > 0 ? -1.35 : 0;
    player.sword.rotation.x = THREE.MathUtils.lerp(player.sword.rotation.x, slash, 0.4);
  }
}

function nearestFoe(bot) {
  let best = null;
  let bestDist = Infinity;
  for (const other of actors) {
    if (other === bot || !other.alive) continue;
    if (isAlly(bot) === isAlly(other)) continue;
    const dist = bot.root.position.distanceTo(other.root.position);
    if (dist < bestDist) {
      best = other;
      bestDist = dist;
    }
  }
  return { foe: best, dist: bestDist };
}

function aimAt(actor, target) {
  const ox = target.root.position.x - actor.root.position.x;
  const oy = target.root.position.y + (target.isBoss ? 8.2 : 1.2) - (actor.root.position.y + 1.5);
  const oz = target.root.position.z - actor.root.position.z;
  actor.yaw = Math.atan2(ox, oz);
  actor.pitch = -Math.atan2(oy, Math.hypot(ox, oz) || 1);
}

function lerpAngle(from, to, t) {
  let d = to - from;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return from + d * Math.min(1, t);
}

function bossShoot() {
  if (!boss.alive || boss.cooldown > 0) return;
  const foe = boss.focus;
  if (!foe || !foe.alive) return;
  boss.cooldown = 1.05;
  const origin = boss.root.position.clone().add(
    new THREE.Vector3(Math.sin(boss.yaw) * 8.4, 9.4, Math.cos(boss.yaw) * 8.4),
  );
  const aim = foe.root.position.clone().add(new THREE.Vector3(0, 1.2, 0));
  const dir = aim.sub(origin).normalize();
  if (dir.lengthSq() < 0.01) return;
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.48, 10, 10),
    new THREE.MeshBasicMaterial({ color: "#ff4fd8" }),
  );
  ball.position.copy(origin);
  scene.add(ball);
  projectiles.push({ mesh: ball, dir, life: 2.1, speed: 38, owner: boss, dmg: 36, hitR: 1.45 });
  beep(160, 0.12, "sawtooth", 0.05);
}

function bossSmash() {
  if (!boss.alive || boss.smashCd > 0) return;
  boss.smashCd = 2.1;
  beep(70, 0.18, "square", 0.06);
  for (const a of actors) {
    if (!a.alive || a.isBoss) continue;
    const dist = a.root.position.distanceTo(boss.root.position);
    if (dist < 13) damage(a, 42, boss, { cause: "The Stag crushed you" });
  }
}

function updateBoss(dt) {
  if (!boss.alive) return;
  boss.root.position.y = 0;
  boss.vy = 0;
  boss.grounded = true;
  boss.root.rotation.x = 0;
  boss.root.rotation.z = 0;
  boss.smashCd = Math.max(0, boss.smashCd - dt);
  boss.retarget -= dt;
  if (boss.retarget <= 0 || !boss.focus || !boss.focus.alive) {
    const { foe } = nearestFoe(boss);
    const pd = player.alive ? player.root.position.distanceTo(boss.root.position) : 999;
    boss.focus = player.alive && pd < 30 ? player : foe;
    boss.retarget = 2.2;
  }
  const foe = boss.focus;
  if (!foe) {
    boss.root.rotation.y = boss.yaw;
    return;
  }
  const ox = foe.root.position.x - boss.root.position.x;
  const oz = foe.root.position.z - boss.root.position.z;
  const dist = Math.hypot(ox, oz);
  const edge = Math.hypot(boss.root.position.x, boss.root.position.z);
  const desired = edge > 18 ? Math.atan2(-boss.root.position.x, -boss.root.position.z) : Math.atan2(ox, oz);
  boss.yaw = lerpAngle(boss.yaw, desired, dt * 2.4);
  const sp = 2.2;
  boss.root.position.x += Math.sin(boss.yaw) * sp * dt;
  boss.root.position.z += Math.cos(boss.yaw) * sp * dt;
  const r = Math.hypot(boss.root.position.x, boss.root.position.z);
  const maxR = 18;
  if (r > maxR) {
    boss.root.position.x *= maxR / r;
    boss.root.position.z *= maxR / r;
  }
  boss.root.rotation.y = boss.yaw;
  if (dist < 13) bossSmash();
  else bossShoot();
}

function updateBots(dt) {
  for (const bot of actors) {
    if (bot.isPlayer || bot.isBoss || !bot.alive) continue;
    bot.ai.next -= dt;
    if (bot.ai.next <= 0) {
      bot.ai.wander = Math.random() * Math.PI * 2;
      bot.ai.next = 1 + Math.random() * 2.5;
      if (!inStorm(bot.root.position.x, bot.root.position.z)) {
        bot.ai.wander = Math.atan2(-bot.root.position.x, -bot.root.position.z);
      }
    }
    const { foe, dist } = nearestFoe(bot);
    const aggro = Boolean(foe);
    if (aggro) {
      aimAt(bot, foe);
      moveActor(bot, Math.sin(bot.yaw) * 0.55, Math.cos(bot.yaw) * 0.55, dt);
      if (dist < 3.2) {
        bot.gun = "sword";
        swingSword(bot);
      } else {
        if (bot.gun === "sword") bot.gun = bot.guns.shotgun ? "shotgun" : bot.guns.rifle ? "rifle" : "pistol";
        shoot(bot);
      }
    } else {
      bot.yaw = bot.ai.wander;
      moveActor(bot, Math.sin(bot.yaw), Math.cos(bot.yaw), dt);
    }
  }
}

function updateProjectiles(dt) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.life -= dt;
    p.mesh.position.addScaledVector(p.dir, (p.speed || 48) * dt);
    let hit = false;
    for (const actor of actors) {
      if (!actor.alive || actor === p.owner) continue;
      if (isAlly(p.owner) === isAlly(actor)) continue;
      let struck = false;
      if (actor.hitSpheres) {
        for (const h of actor.hitSpheres) {
          const c = new THREE.Vector3(h.x, h.y, h.z)
            .applyAxisAngle(new THREE.Vector3(0, 1, 0), actor.yaw)
            .add(actor.root.position);
          if (p.mesh.position.distanceTo(c) < h.r) {
            struck = true;
            break;
          }
        }
      } else {
        const hitY = 1.2;
        const hitR = p.hitR || 0.9;
        struck = p.mesh.position.distanceTo(actor.root.position.clone().setY(actor.root.position.y + hitY)) < hitR;
      }
      if (struck) {
        damage(actor, p.dmg ?? (p.owner.isPlayer ? playerStats().dmg : 8), p.owner);
        hit = true;
        break;
      }
    }
    if (!hit) {
      for (const b of builds) {
        const box = new THREE.Box3().setFromObject(b);
        if (box.containsPoint(p.mesh.position)) {
          b.userData.hp -= 25;
          if (b.userData.hp <= 0) {
            scene.remove(b);
            builds.splice(builds.indexOf(b), 1);
          }
          hit = true;
          break;
        }
      }
    }
    if (hit || p.life <= 0 || p.mesh.position.y < 0) {
      scene.remove(p.mesh);
      projectiles.splice(i, 1);
    }
  }
}

function updateHud() {
  const maxHp = playerStats().maxHealth;
  hpFill.style.width = `${(player.health / maxHp) * 100}%`;
  hpText.textContent = Math.ceil(player.health);
  shieldFill.style.width = `${player.shield}%`;
  shieldText.textContent = Math.ceil(player.shield);
  woodText.textContent = Math.round(player.wood);
  killsHud.textContent = `${matchStats.kills} ELIMS`;
  if (player.gun === "sword") {
    weaponNameEl.textContent = "Sword";
    ammoText.textContent = "MELEE";
  } else {
    const gun = GUNS[player.gun];
    weaponNameEl.textContent = gun.name;
    ammoText.textContent = "∞";
  }
  spText.textContent = skillPoints;
  winsText.textContent = String(wins);
  levelText.textContent = String(playerLevel());
  const alive = actors.filter((a) => a.alive && !a.isBoss).length;
  aliveText.textContent = `${alive} TEAM`;
  if (boss.alive) {
    bossHud.classList.remove("hidden");
    bossFill.style.width = `${(boss.health / boss.maxHealth) * 100}%`;
    bossHpText.textContent = String(Math.ceil(boss.health));
  } else {
    bossHud.classList.add("hidden");
  }
  const r = stormRadius();
  const npcLeft = livingNpcs().length;
  stormText.textContent = lavaOn()
    ? `LAVA · ${npcLeft} NPCS`
    : matchTime < LAVA_DELAY && npcLeft > 0
      ? `LAVA IN ${Math.ceil(LAVA_DELAY - matchTime)}s`
      : "SAFE";
  if (!playing || ended) {
    centerCountdown.classList.add("hidden");
  } else if (!lavaOn() && matchTime < LAVA_DELAY && npcsAlive()) {
    const left = Math.max(1, Math.ceil(LAVA_DELAY - matchTime));
    centerCountdown.classList.remove("hidden", "go");
    centerCountdown.classList.toggle("warn", left <= 3);
    countdownLabel.textContent = "LAVA IN";
    countdownNum.textContent = String(left);
  } else if (lavaOn() && matchTime < LAVA_DELAY + 2.4) {
    centerCountdown.classList.remove("hidden", "warn");
    centerCountdown.classList.add("go");
    countdownNum.textContent = "FLOOR IS LAVA";
  } else {
    centerCountdown.classList.add("hidden");
  }

  miniCtx.clearRect(0, 0, 160, 160);
  miniCtx.fillStyle = "#163d4a";
  miniCtx.beginPath();
  miniCtx.arc(80, 80, 74, 0, Math.PI * 2);
  miniCtx.fill();
  miniCtx.strokeStyle = "#c45cff";
  miniCtx.lineWidth = 2;
  miniCtx.beginPath();
  miniCtx.arc(80, 80, (r / (MAP / 2)) * 74, 0, Math.PI * 2);
  miniCtx.stroke();
  for (const a of actors) {
    if (!a.alive) continue;
    const px = 80 + (a.root.position.x / (MAP / 2)) * 74;
    const pz = 80 + (a.root.position.z / (MAP / 2)) * 74;
    if (a.isBoss) {
      miniCtx.fillStyle = "#c4a06a";
      miniCtx.fillRect(px - 7, pz - 7, 14, 14);
    } else {
      miniCtx.fillStyle = a.isPlayer ? "#7dffb3" : "#4ecdc4";
      miniCtx.fillRect(px - 3, pz - 3, 6, 6);
    }
  }
  for (const chest of chests) {
    if (chest.open) continue;
    const cx = 80 + (chest.x / (MAP / 2)) * 74;
    const cz = 80 + (chest.z / (MAP / 2)) * 74;
    miniCtx.fillStyle = "#ffe566";
    miniCtx.fillRect(cx - 2, cz - 2, 4, 4);
  }
}

function updateCamera() {
  const back = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
  const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
  const camPos = player.root.position
    .clone()
    .add(new THREE.Vector3(0, 1.7, 0))
    .addScaledVector(back, 5.4)
    .add(new THREE.Vector3(0, 1.05 + pitch * 0.6, 0));
  if (snapCamera) {
    camera.position.copy(camPos);
    snapCamera = false;
  } else {
    camera.position.lerp(camPos, 0.18);
  }
  const look = player.root.position.clone().add(new THREE.Vector3(0, 1.45, 0)).addScaledVector(forward, 10);
  look.y -= pitch * 4;
  camera.lookAt(look);
}

const clock = new THREE.Clock();
function tick() {
  requestAnimationFrame(tick);
  const dt = Math.min(0.033, clock.getDelta());
  if (!hpFill) return;
  if (!(playing && player.alive)) {
    justSpace = false;
    justStomp = false;
  }
  if (playing && player.alive) {
    matchTime += dt;
    player.cooldown = Math.max(0, player.cooldown - dt);
    player.harvestCd = Math.max(0, player.harvestCd - dt);
    player.axeSwing = Math.max(0, player.axeSwing - dt);
    player.swordSwing = Math.max(0, (player.swordSwing || 0) - dt);
    for (const a of actors) a.cooldown = Math.max(0, a.cooldown - dt);
    updatePlayer(dt);
    updateBots(dt);
    updateBoss(dt);
    updateProjectiles(dt);
    updateTrees(dt);
    for (const chest of chests) {
      if (chest.open || !chest.gem) continue;
      chest.gem.rotation.y += dt * 2.2;
      chest.gem.position.y = 8.3 + Math.sin(matchTime * 3) * 0.25;
    }
    const stats = playerStats();
    updateLavaLook();
    if (!lavaOn() && matchTime < LAVA_DELAY && npcsAlive()) {
      const cue = `LAVA IN ${Math.ceil(LAVA_DELAY - matchTime)}`;
      if (cue !== lastStormCue && (LAVA_DELAY - matchTime) % 4 < dt + 0.05) {
        lastStormCue = cue;
        flashBanner(cue);
      }
    } else if (lavaOn() && lastStormCue !== "LAVA") {
      lastStormCue = "LAVA";
      flashBanner("THE FLOOR IS LAVA — get on a building");
    } else if (!lavaOn() && matchTime > LAVA_DELAY && lastStormCue === "LAVA") {
      lastStormCue = "LAVA_OFF";
      flashBanner("The lava cools");
    }
    if (stats.regen && player.health < stats.maxHealth * 0.5 && !onLavaFloor(player)) {
      player.health = Math.min(stats.maxHealth, player.health + stats.regen * dt);
    }
    if (stats.regenAlways && !onLavaFloor(player)) {
      player.health = Math.min(stats.maxHealth, player.health + stats.regenAlways * dt);
    }
    if (stats.circleHeal && inStorm(player.root.position.x, player.root.position.z) && !onLavaFloor(player)) {
      player.health = Math.min(stats.maxHealth, player.health + stats.circleHeal * dt);
    }
    if (lavaOn() && onLavaFloor(player)) {
      damage(player, 55 * dt, null, { bypassShield: true, cause: "Lava took you" });
    }
    for (const bot of actors) {
      if (bot.isPlayer || bot.isBoss || !bot.alive) continue;
      if (!inStorm(bot.root.position.x, bot.root.position.z)) {
        damage(bot, 9999, null, { bypassShield: true, cause: "An ally left the circle" });
      }
    }
    if (player.alive && !inStorm(player.root.position.x, player.root.position.z)) {
      damage(player, 9999, null, { bypassShield: true, cause: "You left the circle" });
    }
  }
  updateCamera();
  updateHud();
  renderer.render(scene, camera);
}

let pointerLocked = false;

function beginMatch() {
  resetMatch();
  renderer.domElement.requestPointerLock();
}

startBtn.addEventListener("click", () => beginMatch());
document.getElementById("again-btn").addEventListener("click", () => beginMatch());
document.getElementById("resume-btn").addEventListener("click", () => resumeMatch());
document.getElementById("menu-btn").addEventListener("click", () => {
  playing = false;
  paused = false;
  hud.classList.add("hidden");
  updateCareerLine();
  showPanel("home");
});
document.getElementById("howto-btn").addEventListener("click", () => showPanel("howto"));
document.getElementById("howto-back").addEventListener("click", () => showPanel("home"));
document.getElementById("settings-btn").addEventListener("click", () => showPanel("settings"));
document.getElementById("settings-back").addEventListener("click", () => showPanel("home"));
document.getElementById("skills-menu-btn").addEventListener("click", () => openSkills());
document.getElementById("pause-skills-btn").addEventListener("click", () => openSkills());
document.getElementById("sens-input").addEventListener("input", (e) => {
  mouseSens = Number(e.target.value) / 10000;
  saveProgress();
});
document.getElementById("sound-input").addEventListener("change", (e) => {
  soundOn = e.target.checked;
  saveProgress();
});
document.getElementById("reset-progress").addEventListener("click", () => {
  localStorage.removeItem(SAVE_KEY);
  location.reload();
});

document.addEventListener("pointerlockchange", () => {
  const locked = document.pointerLockElement === renderer.domElement;
  if (pointerLocked && !locked && playing && !ended && !skillsOpen) pauseMatch();
  pointerLocked = locked;
});

document.addEventListener("mousemove", (e) => {
  if (document.pointerLockElement !== renderer.domElement) return;
  yaw -= e.movementX * mouseSens;
  pitch = THREE.MathUtils.clamp(pitch + e.movementY * (mouseSens * 0.9), -0.8, 0.9);
});

document.addEventListener("keydown", (e) => {
  if (e.code.startsWith("Arrow")) e.preventDefault();
  keys.add(e.code);
  if (e.code === "Space" && !e.repeat) justSpace = true;
  if (e.code === "KeyY" && !e.repeat) justStomp = true;
  if (e.code === "KeyQ") setMode("wall");
  if (e.code === "KeyF") setMode("floor");
  if (e.code === "KeyC") setMode("ramp");
  if (e.code === "Digit1") setGun("pistol");
  if (e.code === "Digit2") setGun("rifle");
  if (e.code === "Digit3") setGun("shotgun");
  if (e.code === "Digit4") setGun("sword");
  if (e.code === "KeyR") tryLoot();
  if (e.code === "KeyH" && !e.repeat) {
    if (skillsOpen) {
      const inMatch = resumeAfterSkills || paused;
      resumeAfterSkills = false;
      closeSkills();
      if (inMatch && !ended && !paused) {
        playing = true;
        pauseMatch();
      }
      return;
    }
    if (playing) pauseMatch();
    else resumeMatch();
  }
  if (e.code === "KeyT" && !e.repeat) {
    if (skillsOpen) closeSkills();
    else openSkills();
  }
});
document.addEventListener("keyup", (e) => keys.delete(e.code));

renderer.domElement.addEventListener("mousedown", (e) => {
  if (!playing) return;
  if (e.button === 0) shoot(player);
  if (e.button === 2) placeBuild(player);
});
renderer.domElement.addEventListener("contextmenu", (e) => e.preventDefault());

document.getElementById("skill-close").addEventListener("click", () => closeSkills());

loadProgress();
document.getElementById("sens-input").value = String(Math.round(mouseSens * 10000));
document.getElementById("sound-input").checked = soundOn;
applyMap(currentMap());
updateCareerLine();
renderSkills();
showPanel("home");
tick();

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
