import { _decorator, Component, Vec3 } from 'cc';
import { ShopSim } from '../sim/ShopSim';
import { SeatPlacement } from './SeatPlacement';
import { PlayerController } from './PlayerController';

const { ccclass, property } = _decorator;

@ccclass('ServiceInteractions')
export class ServiceInteractions extends Component {
  @property
  private readonly interactRange: number = 1.35;

  private sim: ShopSim | null = null;
  private seats: SeatPlacement | null = null;
  private player: PlayerController | null = null;
  private bakePos = new Vec3(0.2, 0.5, -1.4);

  public bind(sim: ShopSim, seats: SeatPlacement, player: PlayerController, bakePos?: Vec3): void {
    this.sim = sim;
    this.seats = seats;
    this.player = player;
    if (bakePos) {
      this.bakePos = bakePos.clone();
    }
  }

  public tryInteract(): void {
    if (!this.sim || !this.seats || !this.player) {
      return;
    }
    if (this.sim.getPhase() !== 'open') {
      return;
    }
    if (this.sim.isBaking()) {
      this.sim.advanceBakeStep();
      return;
    }
    const playerPos = this.player.node.worldPosition;
    const customerId = this.findNearestCustomerId(playerPos);
    const nearBake = this.distanceXZ(playerPos, this.bakePos) <= this.interactRange;
    try {
      if (customerId) {
        const order = this.sim.getOrderForCustomer(customerId);
        const held = this.sim.getHeldOrder();
        if ((!order) || (order.status === 'ready' && held?.id === order.id)) {
          this.sim.interactWithCustomer(customerId);
          return;
        }
      }
      if (nearBake) {
        this.sim.interactAtBakeStation();
        return;
      }
      if (customerId) {
        this.sim.interactWithCustomer(customerId);
      }
    } catch {
      // DayDirector reads lastMessage from sim
    }
  }

  private findNearestCustomerId(playerPos: Vec3): string | null {
    if (!this.sim || !this.seats) {
      return null;
    }
    let bestId: string | null = null;
    let best = this.interactRange;
    for (const customer of this.sim.getCustomers()) {
      if (!customer.seatId) {
        continue;
      }
      const seatPos = this.seats.getSeatWorldPos(customer.seatId);
      const dist = this.distanceXZ(playerPos, seatPos);
      if (dist <= best) {
        best = dist;
        bestId = customer.id;
      }
    }
    return bestId;
  }

  private distanceXZ(a: Vec3, b: Vec3): number {
    const dx = a.x - b.x;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dz * dz);
  }
}
