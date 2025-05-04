# InBrowserMcp Chrome 扩展

这是一个 Chrome 浏览器扩展，作为 InBrowserMcp 项目的浏览器端代理。

## 功能

*   通过 WebSocket 与 `mcp-server` 后端服务建立连接。
*   接收来自后端的指令（例如导航、点击、输入等）。
*   使用 Chrome Extension API 在浏览器中执行这些指令。
*   将执行结果或错误信息通过 WebSocket 返回给后端。

## 文件结构

*   `manifest.json`: 扩展的配置文件，定义了权限、背景脚本、内容脚本等。
*   `background.js`: 扩展的背景脚本，负责处理 WebSocket 连接、消息收发以及调用 Chrome API 执行指令。
*   `content.js`: 内容脚本（如果需要），用于与页面 DOM 进行交互。
*   `images/`: 存放扩展图标等图片资源。

## 安装与使用

1.  打开 Chrome 浏览器，进入 `chrome://extensions/`。
2.  启用右上角的“开发者模式”。
3.  点击“加载已解压的扩展程序”。
4.  选择 `InBrowserMcp/extension` 目录。
5.  扩展程序将被加载并出现在列表中。
6.  确保 `mcp-server` 正在运行（默认监听 WebSocket 端口 8081）。
7.  扩展会自动尝试连接到 `ws://localhost:8081`。

## 注意事项

*   确保 `manifest.json` 中声明了执行操作所需的足够权限。
*   `background.js` 中的 WebSocket 地址需要与 `mcp-server` 的实际监听地址和端口匹配。