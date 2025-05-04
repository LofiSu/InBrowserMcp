# InBrowserMCP Project

This project implements a system based on the Model Context Protocol (MCP) that allows an AI model to interact with a web browser via a browser extension.

## Overview

The project consists of three main parts:

1.  **Frontend (`frontend/`)**: A React-based web application that provides the user interface for interacting with the AI and viewing browser state. It communicates with the MCP server.
2.  **MCP Server (`mcp-server/`)**: A Node.js backend server implementing the MCP specification. It orchestrates communication between the frontend, the AI model (implicitly), and the browser extension.
3.  **Browser Extension (`extension/`)**: A Chrome extension that connects to the MCP server via WebSocket and executes browser actions (like navigation, clicks, typing, getting content) based on commands received from the server.

## Architecture

```
+-----------------+      +-----------------+      +---------------------+
| Frontend (React)| <--> | MCP Server (Node)| <--> | Browser Extension   |
| (localhost:5173)|      | (localhost:3000) |      | (via WebSocket 8081)|
+-----------------+      +-----------------+      +---------------------+
       |                      ^
       | User Interaction       | AI Model Interaction (Conceptual)
       v                      |
+-----------------+      +-----------------+
| User's Browser  |      | AI Model        |
+-----------------+      +-----------------+
```

*   The **Frontend** sends user commands (or AI instructions) to the **MCP Server**.
*   The **MCP Server** interprets these commands, potentially interacts with an AI model (not explicitly implemented here but assumed), and translates actions into MCP tool calls.
*   The **MCP Server** sends browser action commands to the **Browser Extension** via WebSocket.
*   The **Browser Extension** executes these actions in the user's browser (e.g., navigates, clicks, scrapes content).
*   The **Browser Extension** sends results (like page snapshots or command outcomes) back to the **MCP Server**.
*   The **MCP Server** processes the results and streams updates or final responses back to the **Frontend** via Server-Sent Events (SSE).

## Getting Started

Follow the instructions in the respective README files for each component:

*   [Frontend README](./frontend/README.md)
*   [MCP Server README](./mcp-server/README.md)
*   [Browser Extension README](./extension/README.md) (Assuming one will be created or instructions added here)

### General Workflow

1.  Start the MCP Server (`cd mcp-server && pnpm dev`).
2.  Load the Browser Extension in Chrome (`chrome://extensions/`).
3.  Start the Frontend (`cd frontend && pnpm dev`).
4.  Open the Frontend application in your browser (usually `http://localhost:5173`).
5.  The frontend will initialize an MCP session with the server, which connects to the extension.
6.  Interact with the frontend to send commands that control the browser via the extension.

## Contributing

(Add contribution guidelines if applicable)

## License

(Specify project license, e.g., MIT)