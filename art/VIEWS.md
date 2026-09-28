# 《叮——》美术：六视面正交规范

最终进游戏是 **固定相机简易 3D**。概念阶段每个可建模资产出 **6 个正交视面**（不是只出前三视图）。

## 六视面

| 视面 | 后缀 | 说明 |
|------|------|------|
| 前 | `front` | 主朝向 |
| 后 | `back` | |
| 左 | `left` | 角色自身左 |
| 右 | `right` | |
| 顶 | `top` | 俯视 |
| 底 | `bottom` | 仰视 |

## 交付

1. **合成六面图**：`art/views/<name>/<name>-6view.png`（2×3 正交拼版）  
2. **分面文件**：裁切后的六张  
   `<name>-front.png` / `-back` / `-left` / `-right` / `-top` / `-bottom`

裁切脚本：`art/scripts/split_6view.py`（对所有 `*-6view.png` 按 2×3 均分裁切；只写 `art/views/`，不同步 public）。


## 画法

- 正交、无透视；六面同一比例  
- 韩系 Q 版（开间小店气质）  
- 奶白/白底，无水印、无装饰字  

## 目录

```
art/views/
  clerk/
  customer-pink/
  customer-blue/
  oven/
  counter/
  table-chair/
  cabinet/
  window-wall/
```
