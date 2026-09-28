import { _decorator, Component, input, Input, EventKeyboard, KeyCode, Label, Node, UITransform, view, Color, Graphics, Vec3 } from 'cc';
import { ShopSim } from '../sim/ShopSim';
import { GreyboxBuilder } from './GreyboxBuilder';
import { PlayerController } from './PlayerController';
import { SeatPlacement } from './SeatPlacement';
import { DayDirector } from './DayDirector';
import { ServiceInteractions } from './ServiceInteractions';
import { CustomerPresenter } from './CustomerPresenter';
import { BakePanel } from './BakePanel';
import { TouchHud } from './TouchHud';
import { loadSave } from './SaveStore';

const { ccclass } = _decorator;

@ccclass('GameRoot')
export class GameRoot extends Component {
  private sim: ShopSim | null = null;
  private dayDirector: DayDirector | null = null;
  private service: ServiceInteractions | null = null;
  private bakePanel: BakePanel | null = null;
  private hudLabel: Label | null = null;
  private floatLabel: Label | null = null;
  private greybox: GreyboxBuilder | null = null;

  protected onLoad(): void {
    const world = new Node('World');
    this.node.addChild(world);
    this.greybox = world.addComponent(GreyboxBuilder);
    const built = this.greybox.build();

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
    this.sim = sim;
    this.syncUnlockVisuals();

    const playerCtrl = built.player.addComponent(PlayerController);
    playerCtrl.bindSim(sim);
    playerCtrl.setWorldCamera(built.camera);

    const seatPlacement = world.addComponent(SeatPlacement);
    seatPlacement.setSnapPoints(built.snapPoints);
    seatPlacement.bindSim(sim);

    this.ensureHud();
    const directorNode = new Node('DayDirector');
    this.node.addChild(directorNode);
    this.dayDirector = directorNode.addComponent(DayDirector);
    this.dayDirector.bind(sim, seatPlacement, playerCtrl);
    if (this.hudLabel) {
      this.dayDirector.setHudLabel(this.hudLabel);
    }
    if (this.floatLabel) {
      this.dayDirector.setFloatLabel(this.floatLabel);
    }
    this.dayDirector.setUnlockChanged(() => this.syncUnlockVisuals());

    this.service = directorNode.addComponent(ServiceInteractions);
    this.service.bind(sim, seatPlacement, playerCtrl, new Vec3(0.2, 0.5, -1.4));

    const customers = world.addComponent(CustomerPresenter);
    customers.bind(sim, seatPlacement);

    const bakeNode = new Node('BakePanel');
    this.node.addChild(bakeNode);
    this.bakePanel = bakeNode.addComponent(BakePanel);
    this.bakePanel.bind(sim);

    const touchNode = new Node('TouchHud');
    this.node.addChild(touchNode);
    const touchHud = touchNode.addComponent(TouchHud);
    if (this.dayDirector && this.service && this.bakePanel) {
      touchHud.bind(sim, this.dayDirector, this.service, this.bakePanel);
    }

    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
  }

  protected onDestroy(): void {
    input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
  }

  private syncUnlockVisuals(): void {
    if (!this.sim || !this.greybox) {
      return;
    }
    this.greybox.syncUnlocks((id) => this.sim!.hasUnlock(id));
  }

  private onKeyDown(event: EventKeyboard): void {
    if (!this.dayDirector || !this.sim) {
      return;
    }
    if (event.keyCode === KeyCode.DIGIT_1 || event.keyCode === KeyCode.NUM_1) {
      this.dayDirector.onToggleSeat(0);
    } else if (event.keyCode === KeyCode.DIGIT_2 || event.keyCode === KeyCode.NUM_2) {
      this.dayDirector.onToggleSeat(1);
    } else if (event.keyCode === KeyCode.DIGIT_3 || event.keyCode === KeyCode.NUM_3) {
      this.dayDirector.onToggleSeat(2);
    } else if (event.keyCode === KeyCode.SPACE) {
      if (this.sim.isBaking()) {
        this.bakePanel?.advance();
      } else if (this.sim.getPhase() === 'settle') {
        this.dayDirector.onRestartDay(true);
      } else {
        this.dayDirector.onOpenShop();
      }
    } else if (event.keyCode === KeyCode.KEY_E) {
      this.service?.tryInteract();
    } else if (event.keyCode === KeyCode.ESCAPE) {
      this.bakePanel?.cancel();
    } else if (event.keyCode === KeyCode.KEY_R && this.sim.getPhase() === 'settle') {
      this.dayDirector.onRestartDay(false);
    }
  }

  private ensureHud(): void {
    const canvas = new Node('HUD');
    this.node.addChild(canvas);
    const transform = canvas.addComponent(UITransform);
    const visible = view.getVisibleSize();
    transform.setContentSize(visible.width, visible.height);

    const panel = new Node('Panel');
    canvas.addChild(panel);
    panel.setPosition(0, visible.height * 0.42, 0);
    const g = panel.addComponent(Graphics);
    g.fillColor = new Color(40, 30, 20, 160);
    g.rect(-480, -32, 960, 64);
    g.fill();

    const labelNode = new Node('Label');
    panel.addChild(labelNode);
    const label = labelNode.addComponent(Label);
    label.string = '《叮——》';
    label.fontSize = 18;
    label.color = Color.WHITE;
    labelNode.addComponent(UITransform).setContentSize(920, 48);
    this.hudLabel = label;

    const floatNode = new Node('Float');
    canvas.addChild(floatNode);
    floatNode.setPosition(0, visible.height * 0.18, 0);
    floatNode.addComponent(UITransform).setContentSize(280, 40);
    const floatLabel = floatNode.addComponent(Label);
    floatLabel.string = '';
    floatLabel.fontSize = 28;
    floatLabel.color = new Color(212, 160, 23);
    floatLabel.horizontalAlign = Label.HorizontalAlign.CENTER;
    floatNode.active = false;
    this.floatLabel = floatLabel;
  }
}
