import { _decorator, Color, Component, Graphics, Label, Node, UITransform, view, EventTouch } from 'cc';
import { ShopSim } from '../sim/ShopSim';
import { DayDirector } from './DayDirector';
import { ServiceInteractions } from './ServiceInteractions';
import { BakePanel } from './BakePanel';
import type { UnlockId } from '../sim/Types';

const { ccclass } = _decorator;

type PrimaryMode = 'open' | 'bake' | 'restart' | 'idle';

@ccclass('TouchHud')
export class TouchHud extends Component {
  private sim: ShopSim | null = null;
  private day: DayDirector | null = null;
  private service: ServiceInteractions | null = null;
  private bake: BakePanel | null = null;
  private primaryLabel: Label | null = null;
  private seatRow: Node | null = null;
  private shopRow: Node | null = null;
  private shopLabels: Partial<Record<UnlockId, Label>> = {};

  public bind(sim: ShopSim, day: DayDirector, service: ServiceInteractions, bake: BakePanel): void {
    this.sim = sim;
    this.day = day;
    this.service = service;
    this.bake = bake;
    this.build();
    this.refresh();
  }

  protected update(): void {
    this.refresh();
  }

  private refresh(): void {
    if (!this.sim || !this.primaryLabel || !this.seatRow || !this.shopRow) {
      return;
    }
    const prepare = this.sim.getPhase() === 'prepare';
    const settle = this.sim.getPhase() === 'settle';
    this.seatRow.active = prepare;
    this.shopRow.active = prepare || settle;
    this.primaryLabel.string = this.primaryText();
    for (const item of this.sim.getCatalog()) {
      const label = this.shopLabels[item.id];
      if (!label) {
        continue;
      }
      if (item.owned) {
        label.string = `${item.label}✓`;
      } else {
        label.string = `${item.label}${item.cost}`;
      }
    }
  }

  private primaryText(): string {
    if (!this.sim) {
      return '操作';
    }
    if (this.sim.isBaking()) {
      return '下一步';
    }
    if (this.sim.getPhase() === 'prepare') {
      return '开业';
    }
    if (this.sim.getPhase() === 'settle') {
      return '再来一天';
    }
    return '互动';
  }

  private primaryMode(): PrimaryMode {
    if (!this.sim) {
      return 'idle';
    }
    if (this.sim.isBaking()) {
      return 'bake';
    }
    if (this.sim.getPhase() === 'prepare') {
      return 'open';
    }
    if (this.sim.getPhase() === 'settle') {
      return 'restart';
    }
    return 'idle';
  }

  private build(): void {
    const visible = view.getVisibleSize();
    const root = new Node('TouchHudRoot');
    this.node.addChild(root);
    root.addComponent(UITransform).setContentSize(visible.width, visible.height);

    this.seatRow = new Node('Seats');
    root.addChild(this.seatRow);
    this.seatRow.setPosition(0, -visible.height * 0.32, 0);
    for (let i = 0; i < 3; i += 1) {
      this.makeButton(this.seatRow, `座位${i + 1}`, (i - 1) * 120, 0, () => this.day?.onToggleSeat(i));
    }

    this.shopRow = new Node('Shop');
    root.addChild(this.shopRow);
    this.shopRow.setPosition(0, -visible.height * 0.38, 0);
    const unlockIds: UnlockId[] = ['flowers', 'rug', 'lamp'];
    unlockIds.forEach((id, i) => {
      const btn = this.makeButton(this.shopRow!, id, (i - 1) * 120, 0, () => this.day?.onBuyUnlock(id), 100);
      const label = btn.getChildByName('Label')?.getComponent(Label);
      if (label) {
        this.shopLabels[id] = label;
      }
    });

    const actionRow = new Node('Actions');
    root.addChild(actionRow);
    actionRow.setPosition(0, -visible.height * 0.45, 0);

    this.makeButton(actionRow, '互动', -140, 0, () => this.service?.tryInteract());
    const primary = this.makeButton(actionRow, '开业', 20, 0, () => this.onPrimary());
    this.primaryLabel = primary.getChildByName('Label')?.getComponent(Label) ?? null;
    this.makeButton(actionRow, '取消', 180, 0, () => this.bake?.cancel());
  }

  private onPrimary(): void {
    const mode = this.primaryMode();
    if (mode === 'bake') {
      this.bake?.advance();
      return;
    }
    if (mode === 'open') {
      this.day?.onOpenShop();
      return;
    }
    if (mode === 'restart') {
      this.day?.onRestartDay(true);
      return;
    }
    this.service?.tryInteract();
  }

  private makeButton(parent: Node, text: string, x: number, y: number, onTap: () => void, width = 110): Node {
    const btn = new Node(`Btn_${text}`);
    parent.addChild(btn);
    btn.setPosition(x, y, 0);
    const half = width / 2;
    btn.addComponent(UITransform).setContentSize(width, 48);
    const g = btn.addComponent(Graphics);
    g.fillColor = new Color(80, 140, 220, 220);
    g.roundRect(-half, -24, width, 48, 12);
    g.fill();

    const labelNode = new Node('Label');
    btn.addChild(labelNode);
    labelNode.addComponent(UITransform).setContentSize(width - 10, 40);
    const label = labelNode.addComponent(Label);
    label.string = text;
    label.fontSize = 16;
    label.color = Color.WHITE;
    label.horizontalAlign = Label.HorizontalAlign.CENTER;

    btn.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
      event.propagationStopped = true;
      onTap();
    }, this);
    return btn;
  }
}
