# 《叮——》美术替换清单

**已锁定风格**：韩系 Q 版小店 → [`ART-DIRECTION.md`](ART-DIRECTION.md)  
**转 3D 以这份为准**：[`art/MODELING.md`](../art/MODELING.md)

逻辑垂直切片已封板。灰盒节点换成正式资源时保持枢轴 / 大致尺寸。

## 概念进度

| 类别 | 状态 |
|------|------|
| 风格锁定 | 完成 |
| 角色立绘 + 六视面 | 店员 + 客人×6 完成 |
| 店内核心家具六视面 | 柜台/烤箱/桌椅/橱柜/窗墙 完成 |
| 店内点缀 | 概念一批；置物架/冰箱/收银机六视面齐 |
| 开放街区 | 全景/分区概念齐；喷泉/路灯/长椅六视面齐 |
| UI 切图 | 未做 |
| 正式 `.glb` | 未入库（转完放 `art/models/`） |
| 预览换模 | 仅角色立绘板进 public；场景仍灰盒 |

## 灰盒 → 正式（摘要）

| 节点 | 当前 | 目标（见 MODELING） |
|------|------|---------------------|
| Player / Customer | 立绘板 + 色块兜底 | `clerk` / `customer-*` 低模 |
| Counter / Oven / Case | 色块 | `counter` / `oven` |
| Furniture（座位） | 色块桌椅 | `table-chair` ×3 |
| Cabinet / Window | 无或色块 | `cabinet` / `window-wall` |
| Unlock_* | 色块 | `unlock-flowers/rug/lamp` |
| 外景 | 未建 | 街区拼件 P2 |

## 建议顺序

1. 角色低模  
2. 烤箱 → 柜台 → 桌椅 → 橱柜 → 窗墙  
3. 置物架 / 冰箱 / 收银机 → 其余点缀  
4. 喷泉 / 路灯 / 长椅 → 店外立面  
5. UI 切图  

预览逻辑：`preview/src/scene.ts` · 客人轮换：`CustomerArtPool`（`artSprites.ts`）。
