# class table

![时间日期|上过的课程|正在上的课程|将要上的课程](./docs/images/show-case.png)

个人学习 tauri 和 wayland layer shell 的实验性产物，在 kde 和 hyprland 上测试正常。

## 开发环境

- [tauri 开发环境](https://v2.tauri.app/start/prerequisites/)
- rust
- nodejs & pnpm

```bash
pnpm i
pnpm tauri dev
```

## 食用方法

根据 [schema](docs/settings.schema.json) 在 `$XDG_CONFIG_HOME/top.pizero.class-table/settings.json` 编写设置
