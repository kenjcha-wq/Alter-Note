# Alter 插件开发与提交指南

## 1. 插件技术协议
所有第三方插件必须遵循以下标准：
* **封装**：必须使用 `(function() { ... })()` 包裹。
* **注册**：使用 `AlterPlugins.register(pluginObject)`。

## 2. 开发者接口 (AlterAPI)
* `AlterAPI.getNotes()`: 获取所有笔记数据。
* `AlterAPI.showMsg(text)`: 触发系统提示。

## 3. 如何提交
1. 在 `plugins/` 文件夹下创建你的插件 JS 文件。
2. 提交 Pull Request。
# Alter Plugin Development & Submission Guide

`Alter` features a decoupled dynamic plugin system, allowing developers to inject functionality without modifying the core logic.

## 1. Technical Protocol
To ensure system stability, all third-party plugins must follow these standards:
* **Encapsulation**: Must be wrapped in an IIFE `(function() { ... })()` to avoid polluting the global namespace.
* **Registration**: Use `AlterPlugins.register(pluginObject)` to mount the feature.
* **Execution**: Core logic should reside within the `run` function.

## 2. Developer Interfaces (AlterAPI)
* `AlterAPI.getNotes()`: Returns a read-only copy of all notes.
* `AlterAPI.showMsg(text)`: Triggers a system synchronization toast at the bottom.
* `AlterAPI.openPanel(id)`: Opens specific UI overlays (e.g., `reflect-overlay`, `lab-overlay`).

## 3. How to Submit
1. Create your plugin JS file in the `plugins/` folder.
2. Follow the naming convention: `feature_name.js`.
3. Submit a Pull Request to this repository.
