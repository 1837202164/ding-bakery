# 《叮——》美术资源

统一放这里。预览运行时只从 `preview/public/art/` 读**正在用的**副本。

## 目录

```
art/
  direction/     # 锁定风格板（仅 locked-qshop）
  characters/    # 预览立绘（已进 public）
  props/         # 道具概念（烤箱/柜台）
  scene/         # 店内 + 开放街区概念
    openworld/
  views/         # 六视面正交（建模母版，不进 public）
  scripts/       # split_6view.py
  VIEWS.md
```

## 运行时（`preview/public/art/`）

| 文件 | 用途 |
|------|------|
| `direction-locked.png` | 标题页背景 |
| `characters/clerk-front.png` | 店员立绘板 |
| `characters/customer-pink.png` | 客人 |
| `characters/customer-blue.png` | 客人 |

其余概念图、六视面只留在 `art/`，需要进游戏时再拷。

## 概念母版（不进 public）

- **店内**：`scene/shop-interior.png` 等  
- **开放街区**：`scene/openworld/`  
- **六视面**：`views/<name>/`（裁切：`python art/scripts/split_6view.py`）  
- **道具概念**：`props/oven.png` · `counter-case.png`

## 约定

- 母版在 `art/`；public 只放当前预览真正加载的图  
- 最终进 Cocos 是 **3D 低模**，六视面是建模参考  
- 废案风格板 A–G 已删除，以 `direction/locked-qshop.png` 为准
