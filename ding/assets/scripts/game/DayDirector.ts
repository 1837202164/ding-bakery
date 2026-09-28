import { _decorator, Component, Label, Node } from 'cc';
import { ShopSim } from '../sim/ShopSim';
import { SeatPlacement } from './SeatPlacement';
import { PlayerController } from './PlayerController';
import { persistFromSim } from './SaveStore';
import type { UnlockId } from '../sim/Types';

const { ccclass, property } = _decorator;

@ccclass('DayDirector')
export class DayDirector extends Component {
  @property(Label)
  private readonly hudLabel: Label | null = null;

  @property(SeatPlacement)
  private readonly seatPlacement: SeatPlacement | null = null;

  @property(PlayerController)
  private readonly player: PlayerController | null = null;

  private sim: ShopSim | null = null;
  private onUnlockChanged: (() => void) | null = null;
  private floatLabel: Label | null = null;
  private floatTimer = 0;

  public bind(sim: ShopSim, seatPlacement: SeatPlacement, player: PlayerController): void {
    this.sim = sim;
    this.seatPlacement = seatPlacement;
    this.player = player;
    this.refreshHud();
  }

  public setHudLabel(label: Label): void {
    this.hudLabel = label;
    this.refreshHud();
  }

  public setFloatLabel(label: Label): void {
    this.floatLabel = label;
    label.node.active = false;
  }

  public setUnlockChanged(cb: () => void): void {
    this.onUnlockChanged = cb;
  }

  protected update(dt: number): void {
    if (!this.sim) {
      return;
    }
    const before = this.sim.getPhase();
    this.sim.tick(dt);
    const after = this.sim.getPhase();
    if (before !== 'settle' && after === 'settle') {
      persistFromSim(this.sim);
    }
    this.flushFeedback(dt);
    this.refreshHud();
  }

  public onToggleSeat(index: number): void {
    this.seatPlacement?.toggleNearestOrIndex(index);
    this.refreshHud();
  }

  public onOpenShop(): void {
    if (!this.sim) {
      return;
    }
    try {
      this.sim.openShop();
    } catch (error) {
      this.setHud(error instanceof Error ? error.message : '无法开业');
      return;
    }
    this.refreshHud();
  }

  public onRestartDay(keepSeats = true): void {
    if (!this.sim) {
      return;
    }
    this.sim.restartDay(keepSeats);
    persistFromSim(this.sim);
    this.seatPlacement?.syncViews();
    this.refreshHud();
  }

  public onBuyUnlock(id: UnlockId): void {
    if (!this.sim) {
      return;
    }
    try {
      this.sim.buyUnlock(id);
      persistFromSim(this.sim);
      this.onUnlockChanged?.();
      this.flushFeedback(0);
    } catch (error) {
      this.setHud(error instanceof Error ? error.message : '无法购买');
    }
    this.refreshHud();
  }

  private flushFeedback(dt: number): void {
    if (!this.sim) {
      return;
    }
    const cue = this.sim.consumeFeedback();
    if (cue && this.floatLabel) {
      this.floatLabel.string = cue.text;
      this.floatLabel.node.active = true;
      this.floatTimer = 1.1;
    }
    this.sim.consumeSfx();
    if (this.floatTimer > 0) {
      this.floatTimer -= dt;
      if (this.floatTimer <= 0 && this.floatLabel) {
        this.floatLabel.node.active = false;
      }
    }
  }

  private refreshHud(): void {
    if (!this.sim) {
      return;
    }
    const phase = this.sim.getPhase();
    const held = this.sim.getHeldOrder();
    const heldText = held ? `｜手持 ${this.sim.getProductLabel(held.productId)}` : '';
    const tip = this.sim.getLastMessage();
    const stats = this.sim.getStats();
    const dayPct = Math.round(this.sim.getDayProgress01() * 100);
    const goalPct = Math.round(this.sim.getGoalProgress01() * 100);
    if (phase === 'prepare') {
      this.setHud(
        `第 ${stats.dayIndex} 天｜准备｜目标 ${stats.happyGoal}｜座位 ${this.sim.getPlacedSeatCount()}/3｜小费罐 ${stats.tipsTotal}`,
      );
      return;
    }
    if (phase === 'open') {
      const left = Math.max(0, this.sim.getDayDurationSec() - this.sim.getElapsedOpenSec());
      const goalTag = stats.goalMet ? '目标✓' : `${stats.happyLeaves}/${stats.happyGoal}`;
      this.setHud(
        `第 ${stats.dayIndex} 天｜${this.sim.getWaveLabel()} ${dayPct}%｜剩 ${Math.ceil(left)}s｜${goalTag}(${goalPct}%)｜小费 ${stats.tipsToday}/${stats.tipsTotal}${heldText}${tip ? `｜${tip}` : ''}`,
      );
      return;
    }
    this.setHud(
      `第 ${stats.dayIndex} 天｜打烊｜${'★'.repeat(stats.stars)}${'☆'.repeat(5 - stats.stars)}｜小费 ${stats.tipsToday}｜罐 ${stats.tipsTotal}｜${this.sim.getSettlementLine()}`,
    );
  }

  private setHud(text: string): void {
    if (this.hudLabel) {
      this.hudLabel.string = text;
    }
  }
}
