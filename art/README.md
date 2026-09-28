# 《叮——》美术资源

统一放这里。预览运行时只从 `preview/public/art/` 读**正在用的**副本。

## 目录

```
art/
  direction/          # 锁定风格板（locked-qshop）
  characters/         # 立绘（已进 public）
  props/              # 烤箱 / 柜台单张概念
  scene/
    shop-*.png        # 店内全景 / 氛围
    chalkboard.png …  # 门、绿植、解锁物等
    props/            # 店内+街区点缀概念（货架、冰箱、喷泉…）
    openworld/        # 小开放街区全景 / 分区
  views/<id>/         # 六视面正交（建模母版，不进 public）
  models/             # （自建）转好的 .glb 放这里
  scripts/split_6view.py
  MODELING.md         # ★ 3D 转换清单
  VIEWS.md
  README.md
```

## 运行时（`preview/public/art/`）

| 文件 | 用途 |
|------|------|
| `direction-locked.png` | 标题页背景 |
| `characters/clerk-front.png` | 店员立绘板 |
| `characters/customer-*.png` | 客人×6（粉/蓝/黄/薄荷/牛仔/小孩） |

其余概念图、六视面只留在 `art/`，需要进游戏时再拷。

## 概念母版

| 类别 | 路径 |
|------|------|
| 3D 转换清单 | [`MODELING.md`](MODELING.md) |
| 六视面规范 | [`VIEWS.md`](VIEWS.md) |
| 店内全景 | `scene/shop-interior.png` · `shop-mood-day.png` |
| 店内点缀 | `scene/props/`（货架、冰箱、收银机、吊灯、凳、钟、篮、蛋糕罩、烤盘、路灯、长椅、喷泉、花箱、围栏…） |
| 开放街区 | `scene/openworld/` |
| 核心道具概念 | `props/oven.png` · `counter-case.png` |

## 六视面已齐（可直接转 3D）

角色：`clerk` · `customer-pink/blue/yellow/mint/denim/kid`  
家具：`oven` · `counter` · `table-chair` · `cabinet` · `window-wall`  
点缀：`wall-shelf` · `mini-fridge` · `cash-register`  
街区：`fountain` · `street-lamp` · `bench`  

完整优先级与状态见 `MODELING.md`。裁切：`python art/scripts/split_6view.py`

## 约定

- 母版在 `art/`；public 只放当前预览真正加载的图  
- 最终进 Cocos 是 **3D 低模**；六视面是建模参考  
- 风格以 `direction/locked-qshop.png` 为准（废案 A–G 已删）
