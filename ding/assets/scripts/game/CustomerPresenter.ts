import { _decorator, Color, Component, MeshRenderer, Node, primitives, utils, Material } from 'cc';
import { ShopSim } from '../sim/ShopSim';
import { SeatPlacement } from './SeatPlacement';

const { ccclass } = _decorator;

@ccclass('CustomerPresenter')
export class CustomerPresenter extends Component {
  private sim: ShopSim | null = null;
  private seats: SeatPlacement | null = null;
  private readonly meshes = new Map<string, Node>();

  public bind(sim: ShopSim, seats: SeatPlacement): void {
    this.sim = sim;
    this.seats = seats;
  }

  protected update(): void {
    if (!this.sim || !this.seats) {
      return;
    }
    const live = new Set(this.sim.getCustomers().map((c) => c.id));
    for (const [id, node] of this.meshes) {
      if (!live.has(id)) {
        node.destroy();
        this.meshes.delete(id);
      }
    }
    for (const customer of this.sim.getCustomers()) {
      if (!customer.seatId) {
        continue;
      }
      let node = this.meshes.get(customer.id);
      if (!node) {
        node = this.makeCustomer(customer.id);
        this.meshes.set(customer.id, node);
      }
      const seatPos = this.seats.getSeatWorldPos(customer.seatId);
      node.setWorldPosition(seatPos.x, 0.45, seatPos.z);
      this.tint(node, customer.patience > 0.35 ? new Color(232, 120, 104) : new Color(170, 68, 68));
    }
  }

  private makeCustomer(id: string): Node {
    const node = new Node(id);
    this.node.addChild(node);
    node.setScale(0.55, 0.9, 0.55);
    const renderer = node.addComponent(MeshRenderer);
    renderer.mesh = utils.createMesh(primitives.box());
    const material = new Material();
    material.initialize({ effectName: 'builtin-unlit' });
    material.setProperty('mainColor', new Color(232, 120, 104));
    renderer.material = material;
    return node;
  }

  private tint(node: Node, color: Color): void {
    const renderer = node.getComponent(MeshRenderer);
    if (!renderer?.material) {
      return;
    }
    renderer.material.setProperty('mainColor', color);
  }
}
