import { _decorator, Color, Component, Graphics, Label, Node, UITransform, view } from 'cc';
import { ShopSim } from '../sim/ShopSim';

const { ccclass } = _decorator;

@ccclass('BakePanel')
export class BakePanel extends Component {
  private sim: ShopSim | null = null;
  private root: Node | null = null;
  private titleLabel: Label | null = null;
  private progressLabel: Label | null = null;
  private actionLabel: Label | null = null;

  public bind(sim: ShopSim): void {
    this.sim = sim;
    this.ensureUi();
    this.refresh();
  }

  protected update(): void {
    this.refresh();
  }

  public advance(): void {
    if (!this.sim?.isBaking()) {
      return;
    }
    this.sim.advanceBakeStep();
    this.refresh();
  }

  public cancel(): void {
    this.sim?.cancelBakeSession();
    this.refresh();
  }

  private refresh(): void {
    if (!this.root || !this.sim || !this.titleLabel || !this.progressLabel || !this.actionLabel) {
      return;
    }
    const session = this.sim.getBakeSession();
    this.root.active = Boolean(session);
    if (!session) {
      return;
    }
    this.titleLabel.string = `制作 ${session.label}`;
    this.progressLabel.string = `步骤 ${session.stepIndex + 1}/${session.totalSteps}：${session.currentStep}`;
    const isLast = session.stepIndex >= session.totalSteps - 1;
    this.actionLabel.string = isLast ? `E / 空格：叮——完成` : `E / 空格：${session.currentStep}`;
  }

  private ensureUi(): void {
    if (this.root) {
      return;
    }
    const visible = view.getVisibleSize();
    this.root = new Node('BakePanelRoot');
    this.node.addChild(this.root);
    this.root.addComponent(UITransform).setContentSize(visible.width, visible.height);

    const card = new Node('Card');
    this.root.addChild(card);
    card.setPosition(0, 0, 0);
    const g = card.addComponent(Graphics);
    g.fillColor = new Color(255, 248, 239, 235);
    g.roundRect(-180, -90, 360, 180, 16);
    g.fill();
    card.addComponent(UITransform).setContentSize(360, 180);

    this.titleLabel = this.makeLabel(card, 'Title', 0, 50, 22, Color.BLACK);
    this.progressLabel = this.makeLabel(card, 'Progress', 0, 10, 16, new Color(90, 60, 40));
    this.actionLabel = this.makeLabel(card, 'Action', 0, -40, 16, new Color(50, 90, 160));
    this.root.active = false;
  }

  private makeLabel(parent: Node, name: string, x: number, y: number, size: number, color: Color): Label {
    const node = new Node(name);
    parent.addChild(node);
    node.setPosition(x, y, 0);
    node.addComponent(UITransform).setContentSize(320, 36);
    const label = node.addComponent(Label);
    label.string = '';
    label.fontSize = size;
    label.color = color;
    label.horizontalAlign = Label.HorizontalAlign.CENTER;
    return label;
  }
}
