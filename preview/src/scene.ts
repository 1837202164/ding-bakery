import * as THREE from 'three';

/** Q-shop palette (开间小店气质：粉樱 / 薄荷 / 奶白 / 木色) */
export const Q = {
  cream: 0xfff7f0,
  wall: 0xfff1e8,
  floor: 0xf0dcc4,
  wood: 0xd2a679,
  woodDeep: 0xb8895b,
  pink: 0xf4a7b9,
  mint: 0x8fcfc0,
  skin: 0xffe2d0,
  apron: 0xfffaf5,
  oven: 0x5a6270,
  ovenGlow: 0xff9a5c,
  board: 0x3d4a3d,
} as const;

export function createBox(w: number, h: number, d: number, color: number, roughness = 0.78): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, roughness }),
  );
}

function softSphere(r: number, color: number, roughness = 0.55): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.SphereGeometry(r, 14, 14),
    new THREE.MeshStandardMaterial({ color, roughness }),
  );
}

/** 店员：韩系 Q 版大头短身 */
export function createCapsuleLike(color: number): THREE.Group {
  const group = new THREE.Group();
  const skirt = createBox(0.48, 0.22, 0.36, Q.pink, 0.65);
  skirt.position.y = 0.14;
  const body = createBox(0.4, 0.36, 0.3, color, 0.7);
  body.position.y = 0.34;
  const head = softSphere(0.3, Q.skin);
  head.position.y = 0.78;
  const hair = softSphere(0.32, 0x5c4033, 0.85);
  hair.position.y = 0.9;
  hair.scale.set(1.05, 0.55, 1);
  const bang = softSphere(0.14, 0x5c4033, 0.85);
  bang.position.set(0, 0.92, 0.22);
  bang.scale.set(1.4, 0.45, 0.6);
  const eyeL = softSphere(0.035, 0x3a2a28, 0.3);
  eyeL.position.set(-0.09, 0.78, 0.26);
  const eyeR = softSphere(0.035, 0x3a2a28, 0.3);
  eyeR.position.set(0.09, 0.78, 0.26);
  const apron = createBox(0.44, 0.3, 0.08, Q.apron, 0.9);
  apron.position.set(0, 0.3, 0.2);
  const pocket = createBox(0.14, 0.1, 0.04, Q.mint, 0.55);
  pocket.position.set(0, 0.24, 0.25);
  const strapL = createBox(0.05, 0.22, 0.04, Q.pink, 0.6);
  strapL.position.set(-0.12, 0.48, 0.16);
  const strapR = createBox(0.05, 0.22, 0.04, Q.pink, 0.6);
  strapR.position.set(0.12, 0.48, 0.16);
  const bow = softSphere(0.07, Q.mint, 0.45);
  bow.position.set(0, 0.98, 0.24);
  const cheekL = softSphere(0.045, 0xffb0b8, 0.4);
  cheekL.position.set(-0.16, 0.7, 0.24);
  const cheekR = softSphere(0.045, 0xffb0b8, 0.4);
  cheekR.position.set(0.16, 0.7, 0.24);
  const armL = createBox(0.1, 0.28, 0.1, Q.skin, 0.65);
  armL.position.set(-0.28, 0.34, 0);
  const armR = createBox(0.1, 0.28, 0.1, Q.skin, 0.65);
  armR.position.set(0.28, 0.34, 0);
  const legL = createBox(0.12, 0.16, 0.14, 0x6b4e3d, 0.8);
  legL.position.set(-0.1, 0.05, 0.02);
  const legR = createBox(0.12, 0.16, 0.14, 0x6b4e3d, 0.8);
  legR.position.set(0.1, 0.05, 0.02);
  group.add(
    skirt, body, head, hair, bang, eyeL, eyeR, apron, pocket, strapL, strapR,
    bow, cheekL, cheekR, armL, armR, legL, legR,
  );
  return group;
}

/** 客人：同 Q 比例，服装色区分 */
export function createCustomerFigure(color: number): THREE.Group {
  const group = new THREE.Group();
  const body = createBox(0.36, 0.36, 0.28, color, 0.7);
  body.position.y = 0.3;
  const head = softSphere(0.27, Q.skin);
  head.position.y = 0.7;
  const hair = softSphere(0.28, 0x6b4e3d, 0.85);
  hair.position.y = 0.8;
  hair.scale.set(1, 0.5, 1);
  const eyeL = softSphere(0.03, 0x3a2a28, 0.3);
  eyeL.position.set(-0.08, 0.7, 0.24);
  const eyeR = softSphere(0.03, 0x3a2a28, 0.3);
  eyeR.position.set(0.08, 0.7, 0.24);
  const cheekL = softSphere(0.04, 0xffb0b8, 0.4);
  cheekL.position.set(-0.14, 0.62, 0.2);
  const cheekR = softSphere(0.04, 0xffb0b8, 0.4);
  cheekR.position.set(0.14, 0.62, 0.2);
  const armL = createBox(0.09, 0.24, 0.09, Q.skin, 0.65);
  armL.position.set(-0.26, 0.3, 0);
  const armR = createBox(0.09, 0.24, 0.09, Q.skin, 0.65);
  armR.position.set(0.26, 0.3, 0);
  const legL = createBox(0.1, 0.14, 0.12, 0x5c4033, 0.8);
  legL.position.set(-0.09, 0.05, 0);
  const legR = createBox(0.1, 0.14, 0.12, 0x5c4033, 0.8);
  legR.position.set(0.09, 0.05, 0);
  group.add(body, head, hair, eyeL, eyeR, cheekL, cheekR, armL, armR, legL, legR);
  return group;
}

export function createChairSet(): THREE.Group {
  const group = new THREE.Group();
  const table = createBox(0.9, 0.08, 0.9, Q.wood, 0.65);
  table.position.y = 0.44;
  const topTrim = createBox(0.92, 0.03, 0.92, 0xe8c9a8, 0.5);
  topTrim.position.y = 0.49;
  const leg = (x: number, z: number): THREE.Mesh => {
    const m = createBox(0.09, 0.44, 0.09, Q.woodDeep);
    m.position.set(x, 0.22, z);
    return m;
  };
  const chair = createBox(0.38, 0.08, 0.38, Q.mint, 0.55);
  chair.position.set(0, 0.3, 0.58);
  const back = createBox(0.38, 0.38, 0.08, Q.pink, 0.55);
  back.position.set(0, 0.48, 0.74);
  group.add(table, topTrim, leg(-0.32, -0.32), leg(0.32, -0.32), leg(-0.32, 0.32), leg(0.32, 0.32), chair, back);
  return group;
}

export function buildBakeryDecor(scene: THREE.Scene): {
  floor: THREE.Mesh;
  counter: THREE.Mesh;
  oven: THREE.Mesh;
  ovenMarker: THREE.Mesh;
  unlockMeshes: Record<'flowers' | 'rug' | 'lamp', THREE.Object3D>;
} {
  scene.background = new THREE.Color(Q.cream);
  scene.fog = new THREE.Fog(Q.cream, 20, 36);

  const floor = createBox(10, 0.1, 8, Q.floor, 0.92);
  floor.position.y = -0.05;
  scene.add(floor);

  for (let x = -4; x <= 4; x += 2) {
    for (let z = -3; z <= 3; z += 2) {
      if ((x + z) % 4 === 0) {
        const tile = createBox(0.95, 0.02, 0.95, 0xe8d0b4, 1);
        tile.position.set(x, 0.01, z);
        scene.add(tile);
      }
    }
  }

  const backWall = createBox(10, 2.6, 0.2, Q.wall);
  backWall.position.set(0, 1.3, -3.8);
  scene.add(backWall);
  scene.add(Object.assign(createBox(0.2, 2.6, 8, 0xffebe0), { position: new THREE.Vector3(-4.9, 1.3, 0) }));
  scene.add(Object.assign(createBox(0.2, 2.6, 8, 0xffebe0), { position: new THREE.Vector3(4.9, 1.3, 0) }));

  // 粉白遮阳棚
  const awning = createBox(4.2, 0.14, 0.85, Q.pink);
  awning.position.set(-2.0, 2.15, -3.2);
  scene.add(awning);
  const awning2 = createBox(4.2, 0.1, 0.85, 0xfffaf5);
  awning2.position.set(-2.0, 2.02, -3.2);
  scene.add(awning2);

  const board = createBox(1.6, 1.05, 0.08, Q.board);
  board.position.set(2.8, 1.4, -3.65);
  scene.add(board);
  const chalk = createBox(1.2, 0.14, 0.04, Q.mint);
  chalk.position.set(2.8, 1.55, -3.58);
  scene.add(chalk);

  const caseBase = createBox(1.85, 0.72, 0.72, Q.wood);
  caseBase.position.set(-3.6, 0.4, -2.2);
  scene.add(caseBase);
  const glass = createBox(1.75, 0.58, 0.58, 0xe8f8ff);
  (glass.material as THREE.MeshStandardMaterial).transparent = true;
  (glass.material as THREE.MeshStandardMaterial).opacity = 0.32;
  glass.position.set(-3.6, 0.98, -2.2);
  scene.add(glass);

  const pastryColors = [0xf2c14e, Q.pink, 0xc47b3a, Q.mint];
  pastryColors.forEach((c, i) => {
    const p = softSphere(0.11, c, 0.45);
    p.position.set(-4.05 + i * 0.3, 0.82, -2.12);
    p.scale.set(1.1, 0.7, 1);
    scene.add(p);
  });

  const counter = createBox(2.65, 0.92, 1.05, Q.wood);
  counter.position.set(-1.8, 0.48, -2.15);
  scene.add(counter);
  const counterTop = createBox(2.75, 0.09, 1.15, 0xe8c9a8, 0.5);
  counterTop.position.set(-1.8, 0.98, -2.15);
  scene.add(counterTop);
  const counterTrim = createBox(2.7, 0.06, 0.08, Q.pink);
  counterTrim.position.set(-1.8, 0.55, -1.6);
  scene.add(counterTrim);

  const oven = createBox(1.35, 1.15, 0.98, Q.oven);
  oven.name = 'oven';
  oven.position.set(0.35, 0.7, -2.25);
  scene.add(oven);
  const ovenBase = createBox(1.4, 0.18, 1.02, 0x454b55);
  ovenBase.position.set(0.35, 0.12, -2.25);
  scene.add(ovenBase);
  const ovenDoor = createBox(0.95, 0.68, 0.06, 0x3a4048);
  ovenDoor.position.set(0.35, 0.62, -1.74);
  scene.add(ovenDoor);
  const ovenWindow = createBox(0.55, 0.32, 0.04, 0xffc090, 0.35);
  (ovenWindow.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(Q.ovenGlow);
  (ovenWindow.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.35;
  ovenWindow.position.set(0.35, 0.66, -1.7);
  scene.add(ovenWindow);
  const handle = createBox(0.55, 0.06, 0.06, Q.pink, 0.4);
  handle.position.set(0.35, 0.38, -1.68);
  scene.add(handle);
  const ovenMarker = softSphere(0.16, Q.pink, 0.4);
  ovenMarker.position.set(0.35, 1.42, -1.55);
  scene.add(ovenMarker);
  const glow = createBox(0.72, 0.1, 0.08, Q.ovenGlow, 0.35);
  glow.position.set(0.35, 0.55, -1.68);
  scene.add(glow);

  const windowLight = createBox(2.3, 1.45, 0.05, 0xfff6dd, 1);
  windowLight.position.set(0.2, 1.5, -3.7);
  scene.add(windowLight);
  const curtainL = createBox(0.18, 1.5, 0.06, Q.pink, 0.7);
  curtainL.position.set(-0.95, 1.5, -3.62);
  scene.add(curtainL);
  const curtainR = createBox(0.18, 1.5, 0.06, Q.mint, 0.7);
  curtainR.position.set(1.35, 1.5, -3.62);
  scene.add(curtainR);

  const plantPot = createBox(0.3, 0.26, 0.3, Q.woodDeep);
  plantPot.position.set(4.2, 0.2, 2.8);
  scene.add(plantPot);
  const plant = softSphere(0.28, 0x6fbf7a, 0.7);
  plant.position.set(4.2, 0.58, 2.8);
  scene.add(plant);

  const unlockMeshes: Record<'flowers' | 'rug' | 'lamp', THREE.Object3D> = {
    flowers: (() => {
      const g = new THREE.Group();
      g.visible = false;
      const pot = createBox(0.36, 0.2, 0.24, Q.wood);
      pot.position.set(0.2, 0.92, -3.55);
      const bloom1 = softSphere(0.1, Q.pink, 0.4);
      bloom1.position.set(0.06, 1.14, -3.48);
      const bloom2 = softSphere(0.09, Q.mint, 0.4);
      bloom2.position.set(0.3, 1.12, -3.46);
      g.add(pot, bloom1, bloom2);
      scene.add(g);
      return g;
    })(),
    rug: (() => {
      const rug = createBox(2.5, 0.035, 1.7, Q.pink, 0.95);
      rug.position.set(0.2, 0.02, 1.4);
      rug.visible = false;
      scene.add(rug);
      return rug;
    })(),
    lamp: (() => {
      const g = new THREE.Group();
      g.visible = false;
      const pole = createBox(0.09, 1.05, 0.09, Q.woodDeep);
      pole.position.set(-3.9, 0.55, 1.2);
      const shade = softSphere(0.28, 0xffe0a0, 0.35);
      shade.position.set(-3.9, 1.22, 1.2);
      shade.scale.set(1.2, 0.85, 1.2);
      g.add(pole, shade);
      scene.add(g);
      return g;
    })(),
  };

  return { floor, counter, oven, ovenMarker, unlockMeshes };
}
