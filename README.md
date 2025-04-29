# In-Browser MCP - 浏览器自动化工具套件
> 很需要感兴趣的同学来一起共建，目前能力欠缺较大。欢迎pr
In-Browser MCP 是一个浏览器自动化工具套件，包含服务器和浏览器扩展。

## 项目结构

- `server`: WebSocket服务器，处理与浏览器扩展的通信
- `frontend`: 浏览器扩展前端

## 安装依赖

### 安装服务器依赖

```bash
cd server
pnpm install
```

### 安装前端依赖

```bash
cd frontend
pnpm install
```

## 运行项目

### 1. 启动服务器

确保首先编译服务器代码：

```bash
cd server
pnpm run build
pnpm start
```

或使用开发模式（监视文件变化）：

```bash
cd server
pnpm run dev
```

服务器将在端口9000上启动WebSocket服务。

### 2. 启动前端

```bash
cd frontend
pnpm run dev
```

前端开发服务器将启动，通常在 http://localhost:5173 上可访问。

## 构建项目

### 构建服务器

```bash
cd server
pnpm run build
```

### 构建前端

```bash
cd frontend
pnpm run build
```

## 项目特性

- 浏览器自动化：点击、输入、截图等
- AI控制：通过AI服务控制浏览器行为
- 工具系统：可扩展的工具系统，方便添加新功能

## 设计思路

整个系统分为服务器和前端两部分：

- 服务器：负责处理与浏览器扩展的通信，并执行工具操作
- 前端：负责与用户交互，并将命令发送到服务器

## 常见问题

### 服务器无法启动

请确保端口9000未被其他应用占用。

### 前端无法连接到服务器

请确保服务器已经启动，并且WebSocket连接在端口9000上运行。

## 更多资源

更多使用指南和API文档，请参考相关文档文件。

## 启动项目可能出现的TypeScript错误

项目使用TypeScript进行开发，在编译时可能会遇到一些类型错误，特别是关于WebSocket模块的导入。这些问题通常不会影响实际运行，但需要进行修复以确保顺利构建。

常见的TypeScript错误包括：

1. WebSocket模块导入问题
2. 类型不匹配
3. 接口不兼容

修复建议：
- 检查tsconfig.json中的设置，确保正确配置模块解析
- 使用兼容的导入方式
- 确保类型定义正确

## 联系方式

如有问题或建议，请提交issue。

