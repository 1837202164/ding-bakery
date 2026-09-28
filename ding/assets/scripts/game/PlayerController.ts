import { _decorator, Component, Node, Vec3, input, Input, EventTouch, Camera, geometry, PhysicsSystem } from 'cc';
import { ShopSim } from '../sim/ShopSim';

const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {
  @property
  private readonly moveSpeed: number = 4;

  @property(Camera)
  private readonly worldCamera: Camera | null = null;

  private readonly target = new Vec3();
  private hasTarget = false;
  private sim: ShopSim | null = null;

  public bindSim(sim: ShopSim): void {
    this.sim = sim;
  }

  public setWorldCamera(camera: Camera): void {
    this.worldCamera = camera;
  }

  protected onEnable(): void {
    input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
  }

  protected onDisable(): void {
    input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
  }

  protected update(dt: number): void {
    if (!this.hasTarget) {
      return;
    }
    const pos = this.node.worldPosition;
    const delta = new Vec3();
    Vec3.subtract(delta, this.target, pos);
    delta.y = 0;
    const dist = delta.length();
    if (dist < 0.08) {
      this.hasTarget = false;
      return;
    }
    delta.normalize();
    const step = Math.min(dist, this.moveSpeed * dt);
    this.node.setWorldPosition(pos.x + delta.x * step, pos.y, pos.z + delta.z * step);
  }

  public getIsMoving(): boolean {
    return this.hasTarget;
  }

  public distanceTo(worldPos: Vec3): number {
    const pos = this.node.worldPosition;
    const dx = pos.x - worldPos.x;
    const dz = pos.z - worldPos.z;
    return Math.sqrt(dx * dx + dz * dz);
  }

  private onTouchEnd(event: EventTouch): void {
    if (!this.worldCamera || !this.sim) {
      return;
    }
    if (this.sim.getPhase() === 'settle') {
      return;
    }
    const location = event.getLocation();
    const ray = new geometry.Ray();
    this.worldCamera.screenPointToRay(location.x, location.y, ray);
    if (PhysicsSystem.instance.raycastClosest(ray)) {
      const result = PhysicsSystem.instance.raycastClosestResult;
      this.target.set(result.hitPoint.x, this.node.worldPosition.y, result.hitPoint.z);
      this.hasTarget = true;
      return;
    }
    const planeY = 0;
    if (Math.abs(ray.d.y) > 1e-5) {
      const t = (planeY - ray.o.y) / ray.d.y;
      if (t > 0) {
        this.target.set(ray.o.x + ray.d.x * t, this.node.worldPosition.y, ray.o.z + ray.d.z * t);
        this.hasTarget = true;
      }
    }
  }
}
