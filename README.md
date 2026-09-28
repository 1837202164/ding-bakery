# 《叮——》项目说明

| 项 | 内容 |
|----|------|
| 正式名 | 《叮——》 |
| 仓库 | [1837202164/ding-bakery](https://github.com/1837202164/ding-bakery) |
| 工程 | `ding/`（Cocos Creator 3.8） |
| 即时预览 | `preview/`（Vite + Three.js） |
| 阶段 | 玩法 M0–M9 已封板；美术概念/六视面齐，待转 3D 低模 |

## 快速试玩

```bash
cd preview
npm install
npm run dev
```

打开 http://127.0.0.1:5173/ （建议 Chrome / Edge）。  
玩法：摆座 → 开业 → 接单 → 烤箱多步骤 → 上餐；早/午/收尾波次；小费罐买装扮。

## 已封板内容（M0–M9）

- 摆座 / 接单 / 制作 / 上餐 / 打烊再开一天  
- 波次、今日目标、小费、装扮解锁、本地存档  
- Web 触控条 + 静音；Cocos TouchHud + SaveStore（微信/本地）

## 美术

| 文档 | 内容 |
|------|------|
| [`art/README.md`](art/README.md) | 资源目录与运行时约定 |
| [`art/MODELING.md`](art/MODELING.md) | **3D 转换清单（按此转模型）** |
| [`art/VIEWS.md`](art/VIEWS.md) | 六视面正交规范 |
| [`docs/ART-DIRECTION.md`](docs/ART-DIRECTION.md) | 风格锁定（韩系 Q 版） |
| [`docs/ART.md`](docs/ART.md) | 灰盒替换进度 |

当前概念：店员 + 客人×6、店内家具/点缀、开放街区、部分六视面已齐。  
正式进游戏：按 `MODELING.md` 出 `.glb` → 替换灰盒。

## 微信小游戏

按 [`ding/docs/WECHAT.md`](ding/docs/WECHAT.md) 用 Creator 3.8 构建。
