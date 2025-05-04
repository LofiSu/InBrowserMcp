# InBrowserMCP Server

This directory contains the backend server for the InBrowserMCP project, built with Node.js, Express, TypeScript, and WebSocket for communication with the browser extension.

## Features

*   Implements the Model Context Protocol (MCP) specification.
*   Handles AI command requests from the frontend.
*   Manages WebSocket connections with the browser extension.
*   Provides tools for browser interaction (navigation, clicking, typing, etc.) via the extension.
*   Manages session state and event streaming.

## Getting Started

### Prerequisites

*   Node.js (LTS version recommended)
*   pnpm (or npm/yarn)

### Installation

1.  Navigate to the `mcp-server` directory:
    ```bash
    cd mcp-server
    ```
2.  Install dependencies:
    ```bash
    pnpm install
    ```

### Running the Server

To compile TypeScript and start the server:

```bash
pnpm start
```

Alternatively, for development with automatic restarts on file changes:

```bash
pnpm dev
```

The MCP server typically runs on port `3000` and the WebSocket server for the extension runs on port `8081`.

## Project Structure

*   `src/`: Source code
    *   `server.ts`: Main server entry point, Express setup, MCP handler.
    *   `tools/`: Implementation of MCP tools interacting with the browser extension.
    *   `types/`: TypeScript type definitions (including MCP tool schemas).
    *   `utils/`: Utility functions.
    *   `resources/`: Static resources (if any).
*   `tsconfig.json`: TypeScript configuration.
*   `package.json`: Project dependencies and scripts.