# 《叮——》项目说明

| 项 | 内容 |
|----|------|
| 正式名 | 《叮——》 |
| 工程 | `ding/`（Cocos Creator 3.8） |
| 即时预览 | `preview/`（Vite + Three.js） |
| 阶段 | **美术锁定**：韩系 Q 版（参照《开间小店》） |

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

## 下一步：美术

资源统一放在 [`art/`](art/)（说明见 `art/README.md`）。  
建模参考为 **六视面正交**：[`art/VIEWS.md`](art/VIEWS.md)。  
风格锁定见 [`docs/ART-DIRECTION.md`](docs/ART-DIRECTION.md)。

## 微信小游戏

按 `ding/docs/WECHAT.md` 用 Creator 3.8 构建。
