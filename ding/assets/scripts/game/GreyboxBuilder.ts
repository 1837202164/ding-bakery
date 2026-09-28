import {
  _decorator,
  Camera,
  Color,
  Component,
  DirectionalLight,
  MeshRenderer,
  Node,
  primitives,
  utils,
  Vec3,
  Material,
  BoxCollider,
  RigidBody,
  ERigidBodyType,
} from 'cc';

const { ccclass } = _decorator;

@ccclass('GreyboxBuilder')
export class GreyboxBuilder extends Component {
  private unlockNodes: Partial<Record<'flowers' | 'rug' | 'lamp', Node>> = {};

  public build(): {
    camera: Camera;
    player: Node;
    floor: Node;
    snapPoints: Node[];
    counter: Node;
  } {
    this.clearChildren();
    this.unlockNodes = {};

    const lightNode = new Node('Sun');
    this.node.addChild(lightNode);
    lightNode.setRotationFromEuler(-40, 30, 0);
    const light = lightNode.addComponent(DirectionalLight);
    light.illuminance = 65000;

    const floor = this.makeBox('Floor', new Vec3(0, -0.05, 0), new Vec3(10, 0.1, 8), new Color(240, 220, 196));
    const body = floor.addComponent(RigidBody);
    body.type = ERigidBodyType.STATIC;
    floor.addComponent(BoxCollider);

    this.makeBox('WallBack', new Vec3(0, 1.3, -3.8), new Vec3(10, 2.6, 0.2), new Color(255, 241, 232));
    this.makeBox('WallLeft', new Vec3(-4.9, 1.3, 0), new Vec3(0.2, 2.6, 8), new Color(255, 235, 224));
    this.makeBox('WallRight', new Vec3(4.9, 1.3, 0), new Vec3(0.2, 2.6, 8), new Color(255, 235, 224));
    this.makeBox('Awning', new Vec3(-2.0, 2.15, -3.2), new Vec3(4.2, 0.14, 0.85), new Color(244, 167, 185));
    this.makeBox('Awning2', new Vec3(-2.0, 2.02, -3.2), new Vec3(4.2, 0.1, 0.85), new Color(255, 250, 245));
    this.makeBox('Case', new Vec3(-3.6, 0.4, -2.2), new Vec3(1.85, 0.72, 0.72), new Color(210, 166, 121));
    this.makeBox('Board', new Vec3(2.8, 1.4, -3.65), new Vec3(1.6, 1.05, 0.08), new Color(61, 74, 61));

    const counter = this.makeBox('Counter', new Vec3(-1.8, 0.48, -2.15), new Vec3(2.65, 0.92, 1.05), new Color(210, 166, 121));
    this.makeBox('Oven', new Vec3(0.35, 0.64, -2.25), new Vec3(1.35, 1.2, 0.98), new Color(90, 98, 112));
    this.makeBox('OvenGlow', new Vec3(0.35, 1.38, -1.55), new Vec3(0.35, 0.35, 0.35), new Color(244, 167, 185));

    // Unlock placeholders (art swap targets)
    this.unlockNodes.flowers = this.makeBox('Unlock_flowers', new Vec3(0.2, 1.05, -3.5), new Vec3(0.4, 0.35, 0.25), new Color(244, 167, 185));
    this.unlockNodes.flowers.active = false;
    this.unlockNodes.rug = this.makeBox('Unlock_rug', new Vec3(0.2, 0.02, 1.4), new Vec3(2.5, 0.035, 1.7), new Color(244, 167, 185));
    this.unlockNodes.rug.active = false;
    this.unlockNodes.lamp = this.makeBox('Unlock_lamp', new Vec3(-3.9, 0.9, 1.2), new Vec3(0.35, 1.15, 0.35), new Color(143, 207, 192));
    this.unlockNodes.lamp.active = false;

    const snapRoot = new Node('SnapPoints');
    this.node.addChild(snapRoot);
    const snapOffsets = [new Vec3(1.5, 0, 1.2), new Vec3(3.0, 0, 1.2), new Vec3(2.2, 0, 2.6)];
    const snapPoints: Node[] = [];
    for (let i = 0; i < snapOffsets.length; i += 1) {
      const snap = this.makeBox(`Snap_${i}`, snapOffsets[i], new Vec3(1.15, 0.04, 1.15), new Color(232, 208, 180));
      snap.setParent(snapRoot);
      snap.setPosition(snapOffsets[i]);
      const furniture = this.makeBox('Furniture', new Vec3(0, 0.35, 0), new Vec3(0.85, 0.7, 0.85), new Color(143, 207, 192));
      furniture.setParent(snap);
      furniture.setPosition(0, 0.35, 0);
      furniture.active = false;
      snapPoints.push(snap);
    }

    const player = this.makeBox('Player', new Vec3(0, 0.5, 2.5), new Vec3(0.55, 1.0, 0.45), new Color(143, 207, 192));

    const camNode = new Node('MainCamera');
    this.node.addChild(camNode);
    camNode.setPosition(0, 9.5, 9.5);
    camNode.setRotationFromEuler(-42, 0, 0);
    const camera = camNode.addComponent(Camera);
    camera.projection = Camera.ProjectionType.ORTHO;
    camera.orthoHeight = 6.2;
    camera.clearColor = new Color(255, 247, 240, 255);
    camera.near = 0.1;
    camera.far = 100;

    return { camera, player, floor, snapPoints, counter };
  }

  public syncUnlocks(has: (id: 'flowers' | 'rug' | 'lamp') => boolean): void {
    (['flowers', 'rug', 'lamp'] as const).forEach((id) => {
      const node = this.unlockNodes[id];
      if (node) {
        node.active = has(id);
      }
    });
  }

  private clearChildren(): void {
    const children = [...this.node.children];
    for (const child of children) {
      child.destroy();
    }
  }

  private makeBox(name: string, position: Vec3, size: Vec3, color: Color): Node {
    const node = new Node(name);
    this.node.addChild(node);
    node.setPosition(position);
    node.setScale(size);
    const renderer = node.addComponent(MeshRenderer);
    renderer.mesh = utils.createMesh(primitives.box());
    const material = new Material();
    material.initialize({ effectName: 'builtin-unlit' });
    material.setProperty('mainColor', color);
    renderer.material = material;
    return node;
  }
}
