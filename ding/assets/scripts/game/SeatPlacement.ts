import { _decorator, Color, Component, MeshRenderer, Node, Vec3 } from 'cc';
import { ShopSim } from '../sim/ShopSim';

const { ccclass, property } = _decorator;

interface SeatView {
  readonly seatId: string;
  readonly snapNode: Node;
  readonly furnitureNode: Node;
}

@ccclass('SeatPlacement')
export class SeatPlacement extends Component {
  @property({ type: [Node] })
  private readonly snapPoints: Node[] = [];

  private sim: ShopSim | null = null;
  private readonly views: SeatView[] = [];

  public setSnapPoints(nodes: Node[]): void {
    this.snapPoints = nodes;
  }

  public bindSim(sim: ShopSim): void {
    this.sim = sim;
    this.views.length = 0;
    const seats = sim.getSeats();
    for (let i = 0; i < seats.length; i += 1) {
      const snap = this.snapPoints[i];
      if (!snap) {
        throw new Error(`Missing snap point for seat index ${i}`);
      }
      const furniture = snap.getChildByName('Furniture');
      if (!furniture) {
        throw new Error(`Snap ${snap.name} needs a child named Furniture`);
      }
      furniture.active = seats[i].placed;
      this.views.push({ seatId: seats[i].id, snapNode: snap, furnitureNode: furniture });
    }
  }

  public toggleNearestOrIndex(index: number): void {
    if (!this.sim) {
      return;
    }
    if (this.sim.getPhase() !== 'prepare') {
      return;
    }
    const seat = this.sim.getSeats()[index];
    if (!seat) {
      return;
    }
    if (seat.placed) {
      this.sim.clearSeat(seat.id);
    } else {
      this.sim.placeSeat(seat.id);
    }
    this.syncViews();
  }

  public placeAllForDebug(): void {
    if (!this.sim) {
      return;
    }
    for (const seat of this.sim.getSeats()) {
      if (!seat.placed) {
        this.sim.placeSeat(seat.id);
      }
    }
    this.syncViews();
  }

  public syncViews(): void {
    if (!this.sim) {
      return;
    }
    for (const view of this.views) {
      const seat = this.sim.getSeats().find((s) => s.id === view.seatId);
      view.furnitureNode.active = Boolean(seat?.placed);
      this.tintSnap(view.snapNode, Boolean(seat?.placed));
    }
  }

  public getSeatWorldPos(seatId: string): Vec3 {
    const view = this.views.find((v) => v.seatId === seatId);
    if (!view) {
      throw new Error(`No view for seat ${seatId}`);
    }
    return view.snapNode.worldPosition.clone();
  }

  private tintSnap(node: Node, placed: boolean): void {
    const renderer = node.getComponent(MeshRenderer);
    if (!renderer || !renderer.material) {
      return;
    }
    const color = placed ? new Color(120, 200, 140, 255) : new Color(180, 180, 120, 255);
    renderer.material.setProperty('mainColor', color);
  }
}
