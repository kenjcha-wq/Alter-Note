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
