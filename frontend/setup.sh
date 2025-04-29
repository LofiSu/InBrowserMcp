#!/bin/bash

# 设置颜色
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 安装依赖
echo -e "${GREEN}安装项目依赖...${NC}"
pnpm install

# 构建项目
echo -e "${GREEN}构建项目...${NC}"
pnpm build

# 完成信息
echo -e "\n${GREEN}构建完成!${NC}"
echo -e "${CYAN}你可以在Chrome浏览器中加载此扩展:${NC}"
echo -e "${YELLOW}1. 打开 chrome://extensions/${NC}"
echo -e "${YELLOW}2. 开启 '开发者模式'${NC}"
echo -e "${YELLOW}3. 点击 '加载已解压的扩展程序'${NC}"
echo -e "${YELLOW}4. 选择 '$(pwd)/dist' 目录${NC}"

# 启动开发服务器的说明
echo -e "\n${CYAN}如需启动开发服务器，请运行:${NC}"
echo -e "${YELLOW}pnpm dev${NC}" 