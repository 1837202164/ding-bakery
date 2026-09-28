import * as THREE from 'three';
import { ShopSim } from './sim/ShopSim';
import { playSfx, unlockAudio, startAmbient, toggleMute } from './sfx';
import { buildBakeryDecor, createCapsuleLike, createChairSet, createCustomerFigure } from './scene';
import { productIcon } from './productIcon';
import type { UnlockId } from './sim/Types';
import { loadSave, writeSave } from './save';
import { ArtPaths, createArtBillboard } from './artSprites';

const hud = document.getElementById('hud');
const msg = document.getElementById('msg');
const bubblesRoot = document.getElementById('bubbles');
const bakeModal = document.getElementById('bake-modal');
const bakeTitle = document.getElementById('bake-title');
const bakeProgress = document.getElementById('bake-progress');
const bakeSteps = document.getElementById('bake-steps');
const bakeAction = document.getElementById('bake-action') as HTMLButtonElement | null;
const bakeCancel = document.getElementById('bake-cancel') as HTMLButtonElement | null;
const settleModal = document.getElementById('settle-modal');
const settleStars = document.getElementById('settle-stars');
const settleLine = document.getElementById('settle-line');
const settleMeta = document.getElementById('settle-meta');
const settleAgain = document.getElementById('settle-again') as HTMLButtonElement | null;
const settleReset = document.getElementById('settle-reset') as HTMLButtonElement | null;
const touchSeats = document.getElementById('touch-seats');
const touchInteract = document.getElementById('touch-interact') as HTMLButtonElement | null;
const touchPrimary = document.getElementById('touch-primary') as HTMLButtonElement | null;
const touchCancel = document.getElementById('touch-cancel') as HTMLButtonElement | null;
const titleSplash = document.getElementById('title-splash');
const titleStart = document.getElementById('title-start') as HTMLButtonElement | null;
const dayBarFill = document.getElementById('day-bar-fill');
const waveChip = document.getElementById('wave-chip');
const coach = document.getElementById('coach');
const coachSkip = document.getElementById('coach-skip') as HTMLButtonElement | null;
const goalBar = document.getElementById('goal-bar');
const goalBarFill = document.getElementById('goal-bar-fill');
const tipTotal = document.getElementById('tip-total');
const tipToday = document.getElementById('tip-today');
const floatsRoot = document.getElementById('floats');
const shopPanel = document.getElementById('shop-panel');
const shopList = document.getElementById('shop-list');
const muteBtn = document.getElementById('mute-btn') as HTMLButtonElement | null;
if (
  !hud || !msg || !bubblesRoot || !bakeModal || !bakeTitle || !bakeProgress || !bakeSteps ||
  !bakeAction || !bakeCancel || !settleModal || !settleStars || !settleLine || !settleMeta ||
  !settleAgain || !settleReset || !touchSeats || !touchInteract || !touchPrimary || !touchCancel ||
  !titleSplash || !titleStart || !dayBarFill || !waveChip || !coach || !coachSkip ||
  !goalBar || !goalBarFill || !tipTotal || !tipToday || !floatsRoot || !shopPanel || !shopList ||
  !muteBtn
) {
  throw new Error('Missing HUD nodes');
}

const INTERACT_RANGE = 1.35;
const saved = loadSave();
const sim = new ShopSim(
  { seatCount: 3, dayDurationSec: 180, spawnIntervalSec: 12 },
  {
    bestStars: saved.bestStars,
    dayIndex: saved.dayIndex,
    tipsTotal: saved.tipsTotal,
    unlocks: saved.unlocks,
  },
);

function dismissTitle(): void {
  titleSplash.classList.add('hidden');
  try {
    unlockAudio();
    startAmbient();
    playSfx('open');
  } catch {
    // Simple Browser / 受限环境可能没有 AudioContext
  }
  if (sim.getStats().dayIndex === 1) {
    coach.classList.add('open');
  }
}

// 在 WebGL 之前绑定，避免画布初始化失败导致按钮无响应
titleStart.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  dismissTitle();
});

muteBtn.addEventListener('click', (event) => {
  event.stopPropagation();
  const muted = toggleMute();
  muteBtn.textContent = muted ? '取消静音' : '静音';
});

let renderer: THREE.WebGLRenderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true });
} catch (error) {
  titleSplash.innerHTML = `<div id="title-card"><p class="brand">叮——</p><p class="sub">当前浏览器无法启动 3D 画布。<br/>请用 Chrome / Edge 打开本页后再试。<br/><code>${error instanceof Error ? error.message : 'WebGL error'}</code></p></div>`;
  throw error;
}
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = false;
renderer.domElement.style.position = 'fixed';
renderer.domElement.style.inset = '0';
renderer.domElement.style.zIndex = '0';
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-8, 8, 5.2, -5.2, 0.1, 100);
camera.position.set(0, 12, 12);
camera.lookAt(0, 0, 0);

scene.add(new THREE.AmbientLight(0xfff4e5, 0.85));
const sun = new THREE.DirectionalLight(0xffe2b8, 1.05);
sun.position.set(5, 11, 6);
scene.add(sun);
const fill = new THREE.DirectionalLight(0xffd9c2, 0.35);
fill.position.set(-4, 6, 2);
scene.add(fill);

const { floor, counter, oven, ovenMarker, unlockMeshes } = buildBakeryDecor(scene);

const steamPuffs: THREE.Mesh[] = [];
for (let i = 0; i < 5; i += 1) {
  const puff = new THREE.Mesh(
    new THREE.SphereGeometry(0.08 + i * 0.015, 8, 8),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      roughness: 1,
    }),
  );
  puff.position.set(0.35 + (i - 2) * 0.06, 1.4, -1.9);
  scene.add(puff);
  steamPuffs.push(puff);
}

const seatOffsets = [
  new THREE.Vector3(1.5, 0, 1.2),
  new THREE.Vector3(3.0, 0, 1.2),
  new THREE.Vector3(2.2, 0, 2.6),
];
const snapPads: THREE.Mesh[] = [];
const furniture: THREE.Object3D[] = [];
for (let i = 0; i < seatOffsets.length; i += 1) {
  const pad = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 0.04, 1.15),
    new THREE.MeshStandardMaterial({ color: 0xd7c29a, roughness: 1 }),
  );
  pad.position.copy(seatOffsets[i]);
  scene.add(pad);
  snapPads.push(pad);
  const chair = createChairSet();
  chair.position.copy(seatOffsets[i]);
  chair.visible = false;
  scene.add(chair);
  furniture.push(chair);
}

const player = new THREE.Group();
player.position.set(0, 0, 2.5);
const playerFallback = createCapsuleLike(0x8fcfc0);
player.add(playerFallback);
player.add(createArtBillboard(ArtPaths.clerk, 1.05, 1.35, () => {
  playerFallback.visible = false;
}));
scene.add(player);

const heldBadge = new THREE.Mesh(
  new THREE.SphereGeometry(0.16, 10, 10),
  new THREE.MeshStandardMaterial({ color: 0xffc857, roughness: 0.45 }),
);
heldBadge.visible = false;
scene.add(heldBadge);

const customerMeshes = new Map<string, THREE.Object3D>();
const bubbleEls = new Map<string, HTMLDivElement>();
const moveTarget = new THREE.Vector3();
let hasMoveTarget = false;
let arriveAction: 'customer' | 'oven' | null = null;
let arriveCustomerId: string | null = null;
const moveSpeed = 4;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const clock = new THREE.Clock();
const ovenInteractPos = new THREE.Vector3(0.35, 0, -1.4);
let playerBaseY = 0;
let idleT = 0;
let wasMoving = false;

function persistSave(): void {
  const stats = sim.getStats();
  writeSave({
    bestStars: stats.bestStars,
    dayIndex: stats.dayIndex,
    tipsTotal: stats.tipsTotal,
    unlocks: sim.getUnlocks(),
  });
}

function syncUnlockVisuals(): void {
  (Object.keys(unlockMeshes) as UnlockId[]).forEach((id) => {
    unlockMeshes[id].visible = sim.hasUnlock(id);
  });
}

function syncShopPanel(): void {
  const phase = sim.getPhase();
  const show = phase === 'prepare' || phase === 'settle';
  shopPanel.classList.toggle('open', show);
  if (!show) {
    shopList.dataset.sig = '';
    return;
  }
  const catalog = sim.getCatalog();
  const sig = `${phase}|${sim.getStats().tipsTotal}|${catalog.map((i) => `${i.id}:${i.owned ? 1 : 0}`).join(',')}`;
  if (shopList.dataset.sig === sig) {
    return;
  }
  shopList.dataset.sig = sig;
  shopList.innerHTML = '';
  for (const item of catalog) {
    const row = document.createElement('div');
    row.className = 'shop-item';
    const title = document.createElement('div');
    title.textContent = `${item.label} · ${item.cost} 小费`;
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = item.blurb;
    const btn = document.createElement('button');
    btn.type = 'button';
    if (item.owned) {
      btn.textContent = '已布置';
      btn.disabled = true;
    } else {
      btn.textContent = item.canAfford ? '布置' : '小费不足';
      btn.disabled = !item.canAfford;
      btn.addEventListener('click', (event) => {
        event.stopPropagation();
        unlockAudio();
        try {
          sim.buyUnlock(item.id);
          persistSave();
          syncUnlockVisuals();
          refreshHud();
        } catch (error) {
          msg.textContent = error instanceof Error ? error.message : '无法购买';
        }
      });
    }
    row.append(title, meta, btn);
    shopList.appendChild(row);
  }
}

function spawnFloat(text: string, kind: string): void {
  const el = document.createElement('div');
  el.className = `float-cue ${kind}`;
  el.textContent = text;
  floatsRoot.appendChild(el);
  window.setTimeout(() => el.remove(), 1200);
}

function flushFeedback(): void {
  const cue = sim.consumeFeedback();
  if (!cue) {
    return;
  }
  spawnFloat(cue.text, cue.kind);
}

function syncSeats(): void {
  const seats = sim.getSeats();
  for (let i = 0; i < seats.length; i += 1) {
    furniture[i].visible = seats[i].placed;
    const mat = snapPads[i].material as THREE.MeshStandardMaterial;
    mat.color.set(seats[i].placed ? 0xb7d7a8 : 0xd7c29a);
  }
}

function flushSfx(): void {
  const cue = sim.consumeSfx();
  if (cue) {
    playSfx(cue);
  }
}

function refreshHud(): void {
  const phase = sim.getPhase();
  const held = sim.getHeldOrder();
  const stats = sim.getStats();
  const heldText = held ? `｜手持 ${sim.getProductLabel(held.productId)}` : '';
  if (phase === 'prepare') {
    hud.textContent = `第 ${stats.dayIndex} 天｜准备中｜目标 ${stats.happyGoal}｜已摆座位 ${sim.getPlacedSeatCount()}/3`;
    waveChip.textContent = '准备 · 摆座开业';
  } else if (phase === 'open') {
    const left = Math.max(0, sim.getDayDurationSec() - sim.getElapsedOpenSec());
    const goalTag = stats.goalMet ? '目标✓' : `${stats.happyLeaves}/${stats.happyGoal}`;
    hud.textContent = `第 ${stats.dayIndex} 天｜${sim.getWaveLabel()}｜剩余 ${Math.ceil(left)}s｜${goalTag}｜开心 ${stats.happyLeaves}${heldText}`;
    waveChip.textContent = `${sim.getWaveLabel()} · 间隔 ${sim.getSpawnIntervalSec().toFixed(0)}s`;
  } else {
    hud.textContent = `第 ${stats.dayIndex} 天｜打烊｜${'★'.repeat(stats.stars)}${'☆'.repeat(5 - stats.stars)}｜历史最佳 ${stats.bestStars} 星`;
    waveChip.textContent = stats.goalMet ? '打烊 · 目标达成' : '打烊';
  }
  dayBarFill.style.width = `${Math.round(sim.getDayProgress01() * 100)}%`;
  goalBarFill.style.width = `${Math.round(sim.getGoalProgress01() * 100)}%`;
  goalBar.classList.toggle('met', stats.goalMet);
  tipTotal.textContent = String(stats.tipsTotal);
  tipToday.textContent = `今日 ${stats.tipsToday}｜目标 ${stats.happyLeaves}/${stats.happyGoal}`;
  msg.textContent = sim.getLastMessage();
  syncBakeModal();
  syncSettleModal();
  syncTouchBar();
  syncShopPanel();
  flushSfx();
  flushFeedback();
}

function syncTouchBar(): void {
  const prepare = sim.getPhase() === 'prepare';
  touchSeats.style.display = prepare ? 'flex' : 'none';
  touchCancel.style.display = sim.isBaking() ? 'block' : 'none';
  if (sim.isBaking()) {
    touchPrimary.textContent = '下一步';
  } else if (prepare) {
    touchPrimary.textContent = '开业';
  } else if (sim.getPhase() === 'settle') {
    touchPrimary.textContent = '再来一天';
  } else {
    touchPrimary.textContent = '互动';
  }
}

function syncSettleModal(): void {
  if (sim.getPhase() !== 'settle') {
    settleModal.classList.remove('open');
    return;
  }
  const stats = sim.getStats();
  settleModal.classList.add('open');
  settleStars.textContent = `${'★'.repeat(stats.stars)}${'☆'.repeat(5 - stats.stars)}`;
  settleLine.textContent = sim.getSettlementLine();
  settleMeta.textContent = `第 ${stats.dayIndex} 天｜开心 ${stats.happyLeaves}/${stats.happyGoal}${stats.goalMet ? '✓' : ''}｜小费今日 ${stats.tipsToday}｜累计 ${stats.tipsTotal}｜最佳 ${stats.bestStars} 星`;
}

function syncBakeModal(): void {
  const session = sim.getBakeSession();
  if (!session) {
    bakeModal.classList.remove('open');
    return;
  }
  bakeModal.classList.add('open');
      bakeTitle.textContent = `${productIcon(session.productId)} 制作 ${session.label}`;
  bakeProgress.textContent = `步骤 ${session.stepIndex + 1} / ${session.totalSteps}`;
  bakeSteps.innerHTML = '';
  session.steps.forEach((step, index) => {
    const el = document.createElement('span');
    el.className = 'bake-step';
    if (index < session.stepIndex) {
      el.classList.add('done');
    } else if (index === session.stepIndex) {
      el.classList.add('current');
    }
    el.textContent = step;
    bakeSteps.appendChild(el);
  });
  const isLast = session.stepIndex >= session.totalSteps - 1;
  bakeAction.textContent = isLast ? `叮—— 完成 ${session.currentStep}` : `做：${session.currentStep}`;
}

function customerWorldPos(customerId: string): THREE.Vector3 | null {
  const customer = sim.getCustomers().find((c) => c.id === customerId);
  if (!customer?.seatId) {
    return null;
  }
  const seatIndex = Number(customer.seatId.split('-')[1]);
  const offset = seatOffsets[seatIndex];
  return new THREE.Vector3(offset.x, 0, offset.z);
}

function bubbleTextForCustomer(customerId: string): string {
  const customer = sim.getCustomers().find((c) => c.id === customerId);
  if (!customer) {
    return '';
  }
  const icon = productIcon(customer.desiredProductId);
  const label = sim.getProductLabel(customer.desiredProductId);
  const order = sim.getOrderForCustomer(customerId);
  if (!order) {
    return `${icon} 想要${label}`;
  }
  if (order.status === 'pending' || order.status === 'baking') {
    return `${icon} 等餐中`;
  }
  if (order.status === 'ready') {
    return `${icon} 可以上啦`;
  }
  return `${icon} ${label}`;
}

function syncCustomers(): void {
  const live = new Set(sim.getCustomers().map((c) => c.id));
  for (const [id, mesh] of customerMeshes) {
    if (!live.has(id)) {
      scene.remove(mesh);
      customerMeshes.delete(id);
      bubbleEls.get(id)?.remove();
      bubbleEls.delete(id);
    }
  }
  for (const customer of sim.getCustomers()) {
    let mesh = customerMeshes.get(customer.id);
    if (!mesh) {
      const color = customer.patience > 0.35 ? 0xf4a7b9 : 0xc4788a;
      const root = new THREE.Group();
      root.userData.customerId = customer.id;
      const fallback = createCustomerFigure(color);
      root.add(fallback);
      const artUrl = customer.id.charCodeAt(customer.id.length - 1) % 2 === 0
        ? ArtPaths.customerPink
        : ArtPaths.customerBlue;
      root.add(createArtBillboard(artUrl, 0.95, 1.2, () => {
        fallback.visible = false;
      }));
      mesh = root;
      scene.add(mesh);
      customerMeshes.set(customer.id, mesh);
      const el = document.createElement('div');
      el.className = 'bubble';
      bubblesRoot.appendChild(el);
      bubbleEls.set(customer.id, el);
    }
    const pos = customerWorldPos(customer.id);
    if (!pos) {
      continue;
    }
    mesh.position.set(pos.x, 0, pos.z);
    const fallbackBody = mesh.children[0] as THREE.Group | undefined;
    const body = fallbackBody?.children[0] as THREE.Mesh | undefined;
    if (body && body.material instanceof THREE.MeshStandardMaterial && fallbackBody?.visible) {
      body.material.color.set(customer.patience > 0.35 ? 0xf4a7b9 : 0xc4788a);
    }

    const bubble = bubbleEls.get(customer.id);
    if (bubble) {
      const patiencePct = Math.max(0, Math.min(1, customer.patience)) * 100;
      const low = customer.patience < 0.35;
      bubble.innerHTML = `${bubbleTextForCustomer(customer.id)}<div class="patience${low ? ' low' : ''}"><i style="width:${patiencePct}%"></i></div>`;
      const projected = new THREE.Vector3(pos.x, 1.25, pos.z);
      projected.project(camera);
      const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;
      bubble.style.left = `${x}px`;
      bubble.style.top = `${y}px`;
    }
  }
}

function syncHeldBadge(): void {
  const held = sim.getHeldOrder();
  heldBadge.visible = Boolean(held);
  if (held) {
    heldBadge.position.set(player.position.x + 0.42, player.position.y + 1.05, player.position.z);
    const mat = heldBadge.material as THREE.MeshStandardMaterial;
    const colors: Record<string, number> = {
      croissant: 0xf2c14e,
      cookie: 0xc47b3a,
      cupcake: 0xe8a0bf,
      cocoa: 0x8b5a2b,
    };
    mat.color.set(colors[held.productId] ?? 0xffc857);
  }
}

function distanceXZ(a: THREE.Vector3, b: THREE.Vector3): number {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dz * dz);
}

function nearestCustomerId(): string | null {
  let bestId: string | null = null;
  let bestDist = INTERACT_RANGE;
  for (const customer of sim.getCustomers()) {
    const pos = customerWorldPos(customer.id);
    if (!pos) {
      continue;
    }
    const dist = distanceXZ(player.position, pos);
    if (dist <= bestDist) {
      bestDist = dist;
      bestId = customer.id;
    }
  }
  return bestId;
}

function tryInteract(): void {
  if (sim.getPhase() !== 'open') {
    return;
  }
  if (sim.isBaking()) {
    advanceBake();
    return;
  }
  const nearOven = distanceXZ(player.position, ovenInteractPos) <= INTERACT_RANGE;
  const customerId = nearestCustomerId();
  try {
    if (customerId) {
      const order = sim.getOrderForCustomer(customerId);
      const held = sim.getHeldOrder();
      if (order && order.status === 'ready' && held?.id === order.id) {
        sim.interactWithCustomer(customerId);
        refreshHud();
        return;
      }
      if (!order) {
        sim.interactWithCustomer(customerId);
        refreshHud();
        return;
      }
    }
    if (nearOven) {
      sim.interactAtBakeStation();
      refreshHud();
      return;
    }
    if (customerId) {
      sim.interactWithCustomer(customerId);
      refreshHud();
      return;
    }
    msg.textContent = '靠近客人接单，或靠近烤箱制作';
  } catch (error) {
    msg.textContent = error instanceof Error ? error.message : '交互失败';
  }
}

function advanceBake(): void {
  try {
    sim.advanceBakeStep();
    refreshHud();
  } catch (error) {
    msg.textContent = error instanceof Error ? error.message : '制作失败';
  }
}

bakeAction.addEventListener('click', () => {
  unlockAudio();
  advanceBake();
});
bakeCancel.addEventListener('click', () => {
  unlockAudio();
  sim.cancelBakeSession();
  refreshHud();
});
settleAgain.addEventListener('click', () => {
  unlockAudio();
  restartDay(true);
});
settleReset.addEventListener('click', () => {
  unlockAudio();
  restartDay(false);
});

touchSeats.querySelectorAll('[data-seat]').forEach((btn) => {
  btn.addEventListener('click', (event) => {
    unlockAudio();
    event.stopPropagation();
    const index = Number((event.currentTarget as HTMLElement).dataset.seat);
    toggleSeat(index);
  });
});
touchInteract.addEventListener('click', (event) => {
  unlockAudio();
  event.stopPropagation();
  tryInteract();
});
touchPrimary.addEventListener('click', (event) => {
  unlockAudio();
  event.stopPropagation();
  if (sim.isBaking()) {
    advanceBake();
  } else if (sim.getPhase() === 'prepare') {
    tryOpenShop();
  } else if (sim.getPhase() === 'settle') {
    restartDay(true);
  } else {
    tryInteract();
  }
});
touchCancel.addEventListener('click', (event) => {
  unlockAudio();
  event.stopPropagation();
  sim.cancelBakeSession();
  refreshHud();
});

coachSkip.addEventListener('click', () => {
  coach.classList.remove('open');
});

function restartDay(keepSeats: boolean): void {
  sim.restartDay(keepSeats);
  persistSave();
  for (const [, mesh] of customerMeshes) {
    scene.remove(mesh);
  }
  customerMeshes.clear();
  for (const [, el] of bubbleEls) {
    el.remove();
  }
  bubbleEls.clear();
  arriveAction = null;
  arriveCustomerId = null;
  hasMoveTarget = false;
  syncSeats();
  refreshHud();
}

function updateSteam(dt: number, baking: boolean): void {
  const t = clock.elapsedTime;
  for (let i = 0; i < steamPuffs.length; i += 1) {
    const puff = steamPuffs[i];
    const mat = puff.material as THREE.MeshStandardMaterial;
    if (!baking) {
      mat.opacity = Math.max(0, mat.opacity - dt * 1.5);
      continue;
    }
    const phase = (t * 0.9 + i * 0.55) % 1.4;
    const rise = phase / 1.4;
    puff.position.set(
      0.35 + Math.sin(t * 1.4 + i) * 0.08,
      1.35 + rise * 0.55,
      -1.85 + Math.cos(t * 1.1 + i) * 0.05,
    );
    const scale = 0.7 + rise * 1.1;
    puff.scale.setScalar(scale);
    mat.opacity = baking ? (1 - rise) * 0.45 : 0;
  }
}

function updateIdleBob(dt: number, moving: boolean): void {
  if (moving) {
    idleT = 0;
    player.position.y = playerBaseY;
    player.rotation.z = 0;
    wasMoving = true;
    return;
  }
  if (wasMoving) {
    wasMoving = false;
  }
  idleT += dt;
  player.position.y = playerBaseY + Math.sin(idleT * 3.2) * 0.035;
  player.rotation.z = Math.sin(idleT * 2.4) * 0.04;
}

window.addEventListener('pointerdown', (event) => {
  unlockAudio();
  if (sim.getPhase() === 'settle' || sim.isBaking()) {
    return;
  }
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  const customerHits = raycaster.intersectObjects([...customerMeshes.values()], true);
  if (customerHits.length > 0) {
    let obj: THREE.Object3D | null = customerHits[0].object;
    while (obj && !obj.userData.customerId) {
      obj = obj.parent;
    }
    const id = obj?.userData.customerId as string | undefined;
    const pos = id ? customerWorldPos(id) : null;
    if (id && pos) {
      moveTarget.set(pos.x, 0, pos.z + 0.7);
      hasMoveTarget = true;
      arriveAction = 'customer';
      arriveCustomerId = id;
    }
    return;
  }

  const ovenHits = raycaster.intersectObjects([oven, ovenMarker, counter], true);
  if (ovenHits.length > 0) {
    moveTarget.copy(ovenInteractPos);
    moveTarget.y = 0;
    hasMoveTarget = true;
    arriveAction = 'oven';
    arriveCustomerId = null;
    return;
  }

  const hits = raycaster.intersectObject(floor);
  if (hits.length > 0) {
    moveTarget.set(hits[0].point.x, 0, hits[0].point.z);
    hasMoveTarget = true;
    arriveAction = null;
    arriveCustomerId = null;
  }
});

window.addEventListener('keydown', (event) => {
  unlockAudio();
  if (event.code === 'Digit1' || event.code === 'Numpad1') {
    toggleSeat(0);
  } else if (event.code === 'Digit2' || event.code === 'Numpad2') {
    toggleSeat(1);
  } else if (event.code === 'Digit3' || event.code === 'Numpad3') {
    toggleSeat(2);
  } else if (event.code === 'Space') {
    event.preventDefault();
    if (sim.isBaking()) {
      advanceBake();
    } else if (sim.getPhase() === 'prepare') {
      tryOpenShop();
    } else if (sim.getPhase() === 'settle') {
      restartDay(true);
    }
  } else if (event.code === 'KeyE') {
    tryInteract();
  }
});

function tryOpenShop(): void {
  try {
    sim.openShop();
    coach.classList.remove('open');
    refreshHud();
  } catch (error) {
    msg.textContent = error instanceof Error ? error.message : '无法开业';
  }
}

function toggleSeat(index: number): void {
  if (sim.getPhase() !== 'prepare') {
    return;
  }
  const seat = sim.getSeats()[index];
  if (!seat) {
    return;
  }
  if (seat.placed) {
    sim.clearSeat(seat.id);
  } else {
    sim.placeSeat(seat.id);
  }
  syncSeats();
  refreshHud();
}

window.addEventListener('resize', () => {
  const aspect = window.innerWidth / window.innerHeight;
  const halfH = 5.2;
  const halfW = halfH * aspect;
  camera.left = -halfW;
  camera.right = halfW;
  camera.top = halfH;
  camera.bottom = -halfH;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function faceArtBillboards(root: THREE.Object3D): void {
  root.traverse((child) => {
    if (!child.userData.isArtBillboard) {
      return;
    }
    const world = new THREE.Vector3();
    child.getWorldPosition(world);
    child.lookAt(camera.position.x, world.y, camera.position.z);
  });
}

function frame(): void {
  const dt = Math.min(0.05, clock.getDelta());
  let moving = false;
  if (hasMoveTarget && !sim.isBaking() && sim.getPhase() !== 'settle') {
    const delta = moveTarget.clone().sub(player.position);
    delta.y = 0;
    const dist = delta.length();
    if (dist < 0.08) {
      hasMoveTarget = false;
      if (arriveAction === 'customer' && arriveCustomerId) {
        try {
          sim.interactWithCustomer(arriveCustomerId);
        } catch (error) {
          msg.textContent = error instanceof Error ? error.message : '交互失败';
        }
      } else if (arriveAction === 'oven') {
        try {
          sim.interactAtBakeStation();
        } catch (error) {
          msg.textContent = error instanceof Error ? error.message : '交互失败';
        }
      }
      arriveAction = null;
      arriveCustomerId = null;
    } else {
      delta.normalize();
      player.position.addScaledVector(delta, Math.min(dist, moveSpeed * dt));
      moving = true;
    }
  }
  const phaseBefore = sim.getPhase();
  sim.tick(dt);
  if (phaseBefore !== 'settle' && sim.getPhase() === 'settle') {
    persistSave();
  }
  updateSteam(dt, sim.isBaking());
  updateIdleBob(dt, moving || sim.isBaking());
  syncCustomers();
  syncHeldBadge();
  faceArtBillboards(player);
  for (const mesh of customerMeshes.values()) {
    faceArtBillboards(mesh);
  }
  refreshHud();
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

syncSeats();
syncUnlockVisuals();
refreshHud();
frame();
