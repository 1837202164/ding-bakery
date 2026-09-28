# 《叮——》3D 转换清单

按游戏节点列出需要做成 **低模 3D** 的资源。  
状态说明：

| 状态 | 含义 |
|------|------|
| 六视面齐 | `art/views/` 有 6 面，可直接开转 |
| 仅概念 | 有单张概念图，缺六视面 |
| 仅灰盒 | 游戏里是色块，几乎无参考图 |
| 未开始 | 尚无单独参考 |

建议交付：`glTF / .glb`（低面、合并材质、轴心贴地）。

**场景元素也要做 3D**（不是只做角色）。店内家具、点缀、解锁物、外景拼件都要低模；只有地板/墙可以优先用贴图平面。全景图只做摆位参考，不要整屋扫成一个模型。

新增点缀概念图目录：`art/scene/props/`

---

## P0 · 角色 + 店内可交互家具（先转）

| ID | 资产 | 参考图 | 状态 | 备注 |
|----|------|--------|------|------|
| `clerk` | 店员（玩家） | `views/clerk/` | 六视面齐 | |
| `customer-pink` | 客人·粉 | `views/customer-pink/` | 六视面齐 | 可换皮 |
| `customer-blue` | 客人·蓝 | `views/customer-blue/` | 六视面齐 | |
| `customer-yellow` | 客人·黄开衫 | `views/customer-yellow/` | 六视面齐 | |
| `customer-mint` | 客人·薄荷卫衣 | `views/customer-mint/` | 六视面齐 | |
| `customer-denim` | 客人·牛仔外套 | `views/customer-denim/` | 六视面齐 | |
| `customer-kid` | 客人·小孩 | `views/customer-kid/` | 六视面齐 | 略小一号 |
| `counter` | 柜台 | `views/counter/` | 六视面齐 | 可与展柜一体 |
| `oven` | 烤箱 | `views/oven/` | 六视面齐 | 制作点；保留暖光窗 |
| `table-chair` | 桌椅套装 | `views/table-chair/` | 六视面齐 | ×3 实例 |
| `cabinet` | 薄荷橱柜 | `views/cabinet/` | 六视面齐 | 后墙 |
| `window-wall` | 窗墙 | `views/window-wall/` | 六视面齐 | |

## P1 · 店内场景点缀（新增多件）

| ID | 资产 | 参考图 | 状态 | 备注 |
|----|------|--------|------|------|
| `wall-shelf` | 墙上置物架 | `views/wall-shelf/` · `scene/props/wall-shelf.png` | 六视面齐 | 可挂后墙 |
| `mini-fridge` | 薄荷绿小冰箱 | `views/mini-fridge/` · `scene/props/mini-fridge.png` | 六视面齐 | 柜台旁 |
| `cash-register` | 收银机 | `views/cash-register/` · `scene/props/cash-register.png` | 六视面齐 | 柜台台面 |
| `pendant-lamp` | 吊灯 | `scene/props/pendant-lamp.png` | 仅概念 | 天花板 |
| `stool` | 吧台凳 | `scene/props/stool.png` | 仅概念 | 柜台外可坐 |
| `wall-clock` | 挂钟 | `scene/props/wall-clock.png` | 仅概念 | |
| `bread-basket` | 面包篮 | `scene/props/bread-basket.png` | 仅概念 | 柜台陈列 |
| `cake-stand` | 蛋糕罩架 | `scene/props/cake-stand.png` | 仅概念 | 展柜/柜台 |
| `baking-tray` | 烤盘套装 | `scene/props/baking-tray.png` | 仅概念 | 烤箱旁氛围 |
| `chalkboard` | 黑板菜单 | `scene/chalkboard.png` | 仅概念 | |
| `door` | 店门 | `scene/door-entrance.png` | 仅概念 | |
| `awning` | 遮阳棚 | 见店内全景 | 仅灰盒 | |
| `plant-pot` | 绿植盆栽 | `scene/plant-pot.png` | 仅概念 | |
| `display-case` | 玻璃展柜 | 含在 counter 参考里 | 仅概念 | 可与柜台拆 |
| `floor` | 木地板 | 全景 | 仅灰盒 | 贴图平面即可 |
| `wall` | 墙面 | 全景 | 仅灰盒 | 贴图平面即可 |

## P1 · 解锁装扮

| ID | 资产 | 参考图 | 状态 | 备注 |
|----|------|--------|------|------|
| `unlock-flowers` | 窗台花 | `scene/flowers-vase.png` | 仅概念 | `flowers` |
| `unlock-rug` | 粉地毯 | `scene/rug-pink.png` | 仅概念 | `rug` |
| `unlock-lamp` | 落地灯 | `scene/lamp-floor.png` | 仅概念 | `lamp` |

## P2 · 开放街区拼件

| ID | 资产 | 参考图 | 状态 | 备注 |
|----|------|--------|------|------|
| `bakery-exterior` | 店外立面 | `openworld/bakery-exterior.png` | 仅概念 | 进店点 |
| `fountain` | 广场喷泉 | `views/fountain/` · `scene/props/fountain.png` | 六视面齐 | 原 plaza-fountain |
| `street-lamp` | 路灯 | `views/street-lamp/` · `scene/props/street-lamp.png` | 六视面齐 | 可多处复用 |
| `bench` | 长椅 | `views/bench/` · `scene/props/bench.png` | 六视面齐 | 公园/广场 |
| `planter-box` | 花箱 | `scene/props/planter-box.png` | 仅概念 | 路边 |
| `fence` | 矮围栏段 | `scene/props/fence.png` | 仅概念 | 公园边界 |
| `tree` | 圆冠树 | 见 `zone-park` | 仅概念（在图里） | |
| `neighbor-shop` | 邻店立面壳 | `openworld/zone-street.png` | 仅概念 | |
| `path-tile` | 石板路 | 布局图 | 未开始 | 贴图优先 |
| `town-hub` | 整镇 | 全景/布局 | 仅概念 | **不整模**，用上列件拼 |

## 暂不转 3D

| 资产 | 原因 |
|------|------|
| 风格板 / 全景 / 布局图 | 参考，非单体 |
| 商品图标 / UI | 先 2D |

---

## 推荐转换顺序

1. 角色：`clerk` → `customer-*`  
2. 核心家具：`oven` → `counter` → `table-chair` → `cabinet` → `window-wall`  
3. **新点缀（六视面齐）**：`wall-shelf` → `mini-fridge` → `cash-register`  
4. 店内小件：吊灯 / 凳 / 钟 / 篮 / 蛋糕罩 / 黑板 / 门 …  
5. 外景（六视面齐）：`fountain` → `street-lamp` → `bench` → 花箱/围栏 → 外立面  

转完把状态改成 **已转 3D**，文件放 `art/models/<id>.glb`。
