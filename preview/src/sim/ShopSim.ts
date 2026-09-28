import {
  BakeSession,
  CustomerState,
  DayPhase,
  DayStats,
  FeedbackCue,
  OrderTicket,
  ProductId,
  PRODUCTS,
  SeatSlot,
  SfxCue,
  UnlockDef,
  UnlockId,
  UNLOCKS,
  WaveId,
} from './Types';

export interface ShopSimConfig {
  readonly seatCount: number;
  readonly dayDurationSec: number;
  readonly targetHappyCustomers: number;
  readonly maxCustomersInShop: number;
  readonly spawnIntervalSec: number;
  readonly patienceMax: number;
}

const DEFAULT_CONFIG: ShopSimConfig = {
  seatCount: 3,
  dayDurationSec: 240,
  targetHappyCustomers: 8,
  maxCustomersInShop: 3,
  spawnIntervalSec: 18,
  patienceMax: 1,
};

function happyGoalForDay(dayIndex: number): number {
  return Math.min(12, 4 + Math.floor((Math.max(1, dayIndex) - 1) * 0.6));
}

function blankDayStats(dayIndex: number, bestStars: number, tipsTotal: number): DayStats {
  return {
    happyLeaves: 0,
    sadLeaves: 0,
    stars: 0,
    bestStars,
    dayIndex,
    tipsToday: 0,
    tipsTotal,
    happyGoal: happyGoalForDay(dayIndex),
    goalMet: false,
  };
}

export class ShopSim {
  private readonly config: ShopSimConfig;
  private phase: DayPhase = 'prepare';
  private readonly seats: SeatSlot[] = [];
  private readonly customers = new Map<string, CustomerState>();
  private readonly orders = new Map<string, OrderTicket>();
  private elapsedOpenSec = 0;
  private spawnCooldown = 0;
  private nextCustomerSeq = 1;
  private nextOrderSeq = 1;
  private heldOrderId: string | null = null;
  private bakingOrderId: string | null = null;
  private bakeStepIndex = 0;
  private stats: DayStats = blankDayStats(1, 0, 0);
  private lastMessage = '';
  private sfxCue: SfxCue | null = null;
  private feedbackCue: FeedbackCue | null = null;
  private settlementLine = '';
  private lastAnnouncedWave: WaveId | null = null;
  private readonly unlocks = new Set<UnlockId>();

  public constructor(
    config: Partial<ShopSimConfig> = {},
    meta?: { bestStars?: number; dayIndex?: number; tipsTotal?: number; unlocks?: UnlockId[] },
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    const dayIndex = Math.max(1, meta?.dayIndex ?? 1);
    const bestStars = meta?.bestStars ?? 0;
    const tipsTotal = Math.max(0, meta?.tipsTotal ?? 0);
    this.stats = blankDayStats(dayIndex, bestStars, tipsTotal);
    for (const id of meta?.unlocks ?? []) {
      if (UNLOCKS.some((u) => u.id === id)) {
        this.unlocks.add(id);
      }
    }
    for (let i = 0; i < this.config.seatCount; i += 1) {
      this.seats.push({ id: `seat-${i}`, occupied: false, placed: false });
    }
  }

  public getPhase(): DayPhase {
    return this.phase;
  }

  public getSeats(): ReadonlyArray<SeatSlot> {
    return this.seats;
  }

  public getCustomers(): ReadonlyArray<CustomerState> {
    return [...this.customers.values()];
  }

  public getOrders(): ReadonlyArray<OrderTicket> {
    return [...this.orders.values()];
  }

  public getStats(): DayStats {
    return { ...this.stats };
  }

  public getHeldOrderId(): string | null {
    return this.heldOrderId;
  }

  public getHeldOrder(): OrderTicket | null {
    if (!this.heldOrderId) {
      return null;
    }
    return this.orders.get(this.heldOrderId) ?? null;
  }

  public getLastMessage(): string {
    return this.lastMessage;
  }

  public getSettlementLine(): string {
    return this.settlementLine;
  }

  public consumeSfx(): SfxCue | null {
    const cue = this.sfxCue;
    this.sfxCue = null;
    return cue;
  }

  public consumeFeedback(): FeedbackCue | null {
    const cue = this.feedbackCue;
    this.feedbackCue = null;
    return cue;
  }

  public getGoalProgress01(): number {
    if (this.stats.happyGoal <= 0) {
      return 1;
    }
    return Math.min(1, this.stats.happyLeaves / this.stats.happyGoal);
  }

  public getUnlocks(): UnlockId[] {
    return [...this.unlocks];
  }

  public hasUnlock(id: UnlockId): boolean {
    return this.unlocks.has(id);
  }

  public getCatalog(): ReadonlyArray<UnlockDef & { owned: boolean; canAfford: boolean }> {
    return UNLOCKS.map((item) => ({
      ...item,
      owned: this.unlocks.has(item.id),
      canAfford: this.stats.tipsTotal >= item.cost,
    }));
  }

  public buyUnlock(id: UnlockId): void {
    if (this.phase !== 'prepare' && this.phase !== 'settle') {
      throw new Error('只能在准备或打烊时布置店面');
    }
    if (this.unlocks.has(id)) {
      throw new Error('已经拥有了');
    }
    const def = UNLOCKS.find((u) => u.id === id);
    if (!def) {
      throw new Error('未知装扮');
    }
    if (this.stats.tipsTotal < def.cost) {
      throw new Error(`小费不够，还差 ${def.cost - this.stats.tipsTotal}`);
    }
    this.stats.tipsTotal -= def.cost;
    this.unlocks.add(id);
    this.lastMessage = `布置了${def.label}：${def.blurb}`;
    this.sfxCue = 'buy';
    this.feedbackCue = { kind: 'buy', text: def.label, amount: def.cost };
  }

  public getProductLabel(productId: ProductId): string {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) {
      throw new Error(`Unknown product ${productId}`);
    }
    return product.label;
  }

  public getBakeSession(): BakeSession | null {
    if (!this.bakingOrderId) {
      return null;
    }
    const order = this.orders.get(this.bakingOrderId);
    if (!order) {
      return null;
    }
    const steps = this.getProductSteps(order.productId);
    return {
      orderId: order.id,
      productId: order.productId,
      label: this.getProductLabel(order.productId),
      steps,
      stepIndex: this.bakeStepIndex,
      currentStep: steps[this.bakeStepIndex] ?? steps[steps.length - 1],
      totalSteps: steps.length,
    };
  }

  public isBaking(): boolean {
    return this.bakingOrderId !== null;
  }

  public getOrderForCustomer(customerId: string): OrderTicket | null {
    const customer = this.customers.get(customerId);
    if (!customer?.orderId) {
      return null;
    }
    return this.orders.get(customer.orderId) ?? null;
  }

  public getElapsedOpenSec(): number {
    return this.elapsedOpenSec;
  }

  public getDayDurationSec(): number {
    return this.config.dayDurationSec;
  }

  public getPlacedSeatCount(): number {
    return this.seats.filter((s) => s.placed).length;
  }

  public getCapacity(): number {
    return Math.min(this.getPlacedSeatCount(), this.config.maxCustomersInShop);
  }

  public placeSeat(seatId: string): void {
    if (this.phase !== 'prepare') {
      throw new Error('Seats can only be placed during prepare.');
    }
    const seat = this.requireSeat(seatId);
    seat.placed = true;
    this.sfxCue = 'seat';
  }

  public clearSeat(seatId: string): void {
    if (this.phase !== 'prepare') {
      throw new Error('Seats can only be cleared during prepare.');
    }
    const seat = this.requireSeat(seatId);
    if (seat.occupied) {
      throw new Error(`Seat ${seatId} is occupied.`);
    }
    seat.placed = false;
    this.sfxCue = 'seat';
  }

  public openShop(): void {
    if (this.phase !== 'prepare') {
      throw new Error('Shop is not in prepare phase.');
    }
    if (this.getPlacedSeatCount() < 1) {
      throw new Error('Place at least one seat before opening.');
    }
    this.phase = 'open';
    this.elapsedOpenSec = 0;
    this.spawnCooldown = 2;
    this.lastAnnouncedWave = 'morning';
    if (this.stats.dayIndex === 1) {
      this.lastMessage = `早市慢慢来｜今日目标 ${this.stats.happyGoal} 位开心客人`;
    } else {
      this.lastMessage = `早市慢慢来｜目标 ${this.stats.happyGoal} 位｜小费罐 ${this.stats.tipsTotal}`;
    }
    this.sfxCue = 'open';
  }

  public tick(dt: number): void {
    if (this.phase !== 'open') {
      return;
    }
    this.elapsedOpenSec += dt;
    this.announceWaveIfNeeded();
    this.spawnCooldown -= dt;
    this.drainPatience(dt);
    if (this.spawnCooldown <= 0) {
      this.trySpawnCustomer();
      this.spawnCooldown = this.getSpawnIntervalSec();
    }
    if (this.elapsedOpenSec >= this.config.dayDurationSec) {
      this.settleDay();
    }
  }

  public takeOrder(customerId: string, productId?: ProductId): OrderTicket {
    const customer = this.requireCustomer(customerId);
    if (customer.orderId) {
      throw new Error(`Customer ${customerId} already ordered.`);
    }
    if (customer.mood !== 'waiting') {
      throw new Error(`Customer ${customerId} cannot order.`);
    }
    const order: OrderTicket = {
      id: `order-${this.nextOrderSeq++}`,
      customerId,
      productId: productId ?? customer.desiredProductId,
      status: 'pending',
    };
    this.orders.set(order.id, order);
    customer.orderId = order.id;
    this.lastMessage = `已接下：${this.getProductLabel(order.productId)}`;
    this.sfxCue = 'order';
    return order;
  }

  public startBaking(orderId: string): void {
    const order = this.requireOrder(orderId);
    if (order.status !== 'pending') {
      throw new Error(`Order ${orderId} is not pending.`);
    }
    order.status = 'baking';
  }

  public finishBaking(orderId: string): void {
    const order = this.requireOrder(orderId);
    if (order.status !== 'baking') {
      throw new Error(`Order ${orderId} is not baking.`);
    }
    order.status = 'ready';
  }

  public serveOrder(orderId: string): void {
    const order = this.requireOrder(orderId);
    if (order.status !== 'ready') {
      throw new Error(`Order ${orderId} is not ready.`);
    }
    const customer = this.requireCustomer(order.customerId);
    order.status = 'served';
    customer.mood = 'happy';
    if (this.heldOrderId === orderId) {
      this.heldOrderId = null;
    }
    const tip = this.awardTip(customer.patience);
    this.lastMessage = tip > 0
      ? `上餐成功：${this.getProductLabel(order.productId)}｜小费 +${tip}`
      : `上餐成功：${this.getProductLabel(order.productId)}`;
    this.sfxCue = tip > 0 ? 'tip' : 'serve';
    this.feedbackCue = {
      kind: tip > 0 ? 'tip' : 'serve',
      text: tip > 0 ? `开心！+${tip}` : '开心！',
      amount: tip,
    };
    this.releaseCustomer(customer, true);
    this.checkHappyGoal();
  }

  public interactWithCustomer(customerId: string): void {
    if (this.phase !== 'open') {
      throw new Error('Not open.');
    }
    const customer = this.requireCustomer(customerId);
    const order = this.getOrderForCustomer(customerId);
    if (!order) {
      this.takeOrder(customerId);
      return;
    }
    if (order.status === 'ready' && this.heldOrderId === order.id) {
      this.serveOrder(order.id);
      return;
    }
    if (order.status === 'pending' || order.status === 'baking') {
      this.lastMessage = `先去烤箱做：${this.getProductLabel(order.productId)}`;
      return;
    }
    if (order.status === 'ready' && this.heldOrderId !== order.id) {
      this.lastMessage = '先去烤箱取餐';
      return;
    }
    throw new Error('Nothing to do with this customer.');
  }

  public interactAtBakeStation(): void {
    if (this.phase !== 'open') {
      throw new Error('Not open.');
    }
    if (this.bakingOrderId) {
      this.lastMessage = '制作进行中，先完成当前步骤';
      return;
    }
    if (this.heldOrderId) {
      const held = this.requireOrder(this.heldOrderId);
      this.lastMessage = `手持 ${this.getProductLabel(held.productId)}，去送给客人`;
      return;
    }
    const pending = [...this.orders.values()].find((o) => o.status === 'pending');
    if (!pending) {
      this.lastMessage = '没有待做的订单';
      return;
    }
    pending.status = 'baking';
    this.bakingOrderId = pending.id;
    this.bakeStepIndex = 0;
    const session = this.getBakeSession();
    this.lastMessage = `开始制作 ${session?.label ?? ''}：${session?.currentStep ?? ''}`;
  }

  public advanceBakeStep(): boolean {
    const session = this.getBakeSession();
    if (!session) {
      throw new Error('No active bake session.');
    }
    const order = this.requireOrder(session.orderId);
    if (this.bakeStepIndex < session.totalSteps - 1) {
      this.bakeStepIndex += 1;
      const next = this.getBakeSession();
      this.lastMessage = `${session.label} ${this.bakeStepIndex + 1}/${session.totalSteps}：${next?.currentStep ?? ''}`;
      this.sfxCue = 'bake-step';
      return false;
    }
    order.status = 'ready';
    this.heldOrderId = order.id;
    this.bakingOrderId = null;
    this.bakeStepIndex = 0;
    this.lastMessage = `叮—— ${session.label} 做好了`;
    this.sfxCue = 'ding';
    return true;
  }

  public cancelBakeSession(): void {
    if (!this.bakingOrderId) {
      return;
    }
    const order = this.orders.get(this.bakingOrderId);
    if (order && order.status === 'baking') {
      order.status = 'pending';
    }
    this.bakingOrderId = null;
    this.bakeStepIndex = 0;
    this.lastMessage = '取消制作';
    this.sfxCue = 'cancel';
  }

  public restartDay(keepSeats = true): void {
    const placed = new Set(this.seats.filter((s) => s.placed).map((s) => s.id));
    const bestStars = Math.max(this.stats.bestStars, this.stats.stars);
    const dayIndex = this.stats.dayIndex + 1;
    const tipsTotal = this.stats.tipsTotal;
    this.customers.clear();
    this.orders.clear();
    this.heldOrderId = null;
    this.bakingOrderId = null;
    this.bakeStepIndex = 0;
    this.elapsedOpenSec = 0;
    this.spawnCooldown = 0;
    this.nextCustomerSeq = 1;
    this.nextOrderSeq = 1;
    this.stats = blankDayStats(dayIndex, bestStars, tipsTotal);
    this.settlementLine = '';
    this.lastAnnouncedWave = null;
    this.feedbackCue = null;
    this.phase = 'prepare';
    for (const seat of this.seats) {
      seat.occupied = false;
      seat.placed = keepSeats ? placed.has(seat.id) : false;
    }
    this.lastMessage = keepSeats
      ? `新的一天｜今日目标 ${this.stats.happyGoal} 位开心客人`
      : `新的一天，请重新摆座｜目标 ${this.stats.happyGoal} 位`;
    this.sfxCue = 'seat';
  }

  public getProductSteps(productId: ProductId): ReadonlyArray<string> {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) {
      throw new Error(`Unknown product ${productId}`);
    }
    return product.steps;
  }

  private settleDay(): void {
    this.phase = 'settle';
    for (const customer of [...this.customers.values()]) {
      this.releaseCustomer(customer, false);
    }
    this.stats.stars = this.computeStars();
    if (this.stats.goalMet) {
      this.stats.stars = Math.min(5, this.stats.stars + 1);
      const bonus = 5;
      this.stats.tipsToday += bonus;
      this.stats.tipsTotal += bonus;
    }
    this.stats.bestStars = Math.max(this.stats.bestStars, this.stats.stars);
    this.settlementLine = this.buildSettlementLine(this.stats.stars);
    this.lastMessage = this.settlementLine;
    this.sfxCue = 'settle';
  }

  public getDayProgress01(): number {
    if (this.phase === 'prepare') {
      return 0;
    }
    if (this.phase === 'settle') {
      return 1;
    }
    return Math.min(1, this.elapsedOpenSec / this.config.dayDurationSec);
  }

  public getWaveId(): WaveId {
    const p = this.getDayProgress01();
    if (this.phase !== 'open') {
      return p >= 1 ? 'afternoon' : 'morning';
    }
    if (p < 0.28) {
      return 'morning';
    }
    if (p < 0.62) {
      return 'lunch';
    }
    return 'afternoon';
  }

  public getWaveLabel(): string {
    const labels: Record<WaveId, string> = {
      morning: '早市',
      lunch: '午市',
      afternoon: '收尾',
    };
    return labels[this.getWaveId()];
  }

  public getSpawnIntervalSec(): number {
    const dayScale = 1 / (1 + (this.stats.dayIndex - 1) * 0.08);
    const wave = this.getWaveId();
    const waveMul = wave === 'morning' ? 1.35 : wave === 'lunch' ? 0.52 : 0.95;
    const lampMul = this.unlocks.has('lamp') ? 0.9 : 1;
    return Math.max(5.5, this.config.spawnIntervalSec * dayScale * waveMul * lampMul);
  }

  private announceWaveIfNeeded(): void {
    const wave = this.getWaveId();
    if (wave === this.lastAnnouncedWave) {
      return;
    }
    this.lastAnnouncedWave = wave;
    if (wave === 'lunch') {
      this.lastMessage = '午市到了，烤箱要忙起来';
      this.sfxCue = 'wave';
    } else if (wave === 'afternoon') {
      this.lastMessage = '客流缓下来了，收个尾';
      this.sfxCue = 'wave';
    }
  }

  private awardTip(patience: number): number {
    let tip = 1;
    if (patience > 0.7) {
      tip = 3;
    } else if (patience > 0.4) {
      tip = 2;
    }
    if (this.unlocks.has('rug')) {
      tip += 1;
    }
    this.stats.tipsToday += tip;
    this.stats.tipsTotal += tip;
    return tip;
  }

  private checkHappyGoal(): void {
    if (this.stats.goalMet || this.stats.happyLeaves < this.stats.happyGoal) {
      return;
    }
    this.stats.goalMet = true;
    this.lastMessage = `今日目标达成！开心客人 ${this.stats.happyLeaves}/${this.stats.happyGoal}`;
    this.sfxCue = 'goal';
    this.feedbackCue = { kind: 'goal', text: '目标达成！', amount: this.stats.happyGoal };
  }

  private buildSettlementLine(stars: number): string {
    const goalText = this.stats.goalMet
      ? `目标达成｜小费 ${this.stats.tipsToday}`
      : `目标 ${this.stats.happyLeaves}/${this.stats.happyGoal}｜小费 ${this.stats.tipsToday}`;
    if (stars >= 5) {
      return `烤箱叮了一整天，街坊都记住你家香味了。${goalText}`;
    }
    if (stars >= 4) {
      return `黄油香飘出门外，今天是暖烘烘的一天。${goalText}`;
    }
    if (stars >= 3) {
      return `有人笑着离开，也有人匆匆走过——明天再忙一点。${goalText}`;
    }
    if (stars >= 2) {
      return `今天有点手忙脚乱，好在炉火还在。${goalText}`;
    }
    return `今天有点小遗憾，擦擦柜台，明天再来。${goalText}`;
  }

  private computeStars(): number {
    const happy = this.stats.happyLeaves;
    const total = happy + this.stats.sadLeaves;
    const happyRate = total === 0 ? 0 : happy / total;
    if (happyRate >= 0.9 && happy >= this.config.targetHappyCustomers) {
      return 5;
    }
    if (happyRate >= 0.8 && happy >= 7) {
      return 4;
    }
    if (happyRate >= 0.65 && happy >= 5) {
      return 3;
    }
    if (happyRate >= 0.4 && happy >= 3) {
      return 2;
    }
    return 1;
  }

  private trySpawnCustomer(): void {
    if (this.customers.size >= this.getCapacity()) {
      return;
    }
    const freeSeat = this.seats.find((s) => s.placed && !s.occupied);
    if (!freeSeat) {
      return;
    }
    const id = `customer-${this.nextCustomerSeq++}`;
    freeSeat.occupied = true;
    this.customers.set(id, {
      id,
      seatId: freeSeat.id,
      patience: this.config.patienceMax,
      mood: 'waiting',
      orderId: null,
      desiredProductId: this.pickProduct(),
    });
  }

  private drainPatience(dt: number): void {
    const wave = this.getWaveId();
    const waveMul = wave === 'lunch' ? 1.25 : wave === 'afternoon' ? 0.9 : 1;
    const dayMul = 1 + Math.min(0.35, (this.stats.dayIndex - 1) * 0.04);
    const flowerMul = this.unlocks.has('flowers') ? 0.85 : 1;
    const drainPerSec = (1 / 45) * waveMul * dayMul * flowerMul;
    for (const customer of [...this.customers.values()]) {
      if (customer.mood !== 'waiting') {
        continue;
      }
      customer.patience = Math.max(0, customer.patience - drainPerSec * dt);
      if (customer.patience <= 0) {
        customer.mood = 'disappointed';
        this.sfxCue = 'sad';
        this.feedbackCue = { kind: 'sad', text: '走了…' };
        this.releaseCustomer(customer, false);
      }
    }
  }

  private releaseCustomer(customer: CustomerState, happy: boolean): void {
    if (customer.seatId) {
      const seat = this.seats.find((s) => s.id === customer.seatId);
      if (seat) {
        seat.occupied = false;
      }
    }
    if (happy) {
      this.stats.happyLeaves += 1;
    } else if (customer.mood === 'disappointed' || this.phase === 'settle') {
      this.stats.sadLeaves += 1;
    }
    if (customer.orderId) {
      if (this.heldOrderId === customer.orderId) {
        this.heldOrderId = null;
      }
      if (this.bakingOrderId === customer.orderId) {
        this.bakingOrderId = null;
        this.bakeStepIndex = 0;
      }
      this.orders.delete(customer.orderId);
    }
    this.customers.delete(customer.id);
  }

  private pickProduct(): ProductId {
    const index = Math.floor(Math.random() * PRODUCTS.length);
    return PRODUCTS[index].id;
  }

  private requireSeat(seatId: string): SeatSlot {
    const seat = this.seats.find((s) => s.id === seatId);
    if (!seat) {
      throw new Error(`Unknown seat ${seatId}`);
    }
    return seat;
  }

  private requireCustomer(customerId: string): CustomerState {
    const customer = this.customers.get(customerId);
    if (!customer) {
      throw new Error(`Unknown customer ${customerId}`);
    }
    return customer;
  }

  private requireOrder(orderId: string): OrderTicket {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error(`Unknown order ${orderId}`);
    }
    return order;
  }
}
