# InBrowserMCP Frontend

This directory contains the frontend application for the InBrowserMCP project, built with React, Vite, and TypeScript.

## Features

*   Provides a user interface to interact with the MCP server.
*   Sends AI commands to the backend.
*   Displays results and manages session state.

## Getting Started

### Prerequisites

*   Node.js (LTS version recommended)
*   pnpm (or npm/yarn)

### Installation

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    pnpm install
    ```

### Running the Development Server

To start the Vite development server:

```bash
pnpm dev
```

This will typically start the frontend application on `http://localhost:5173` (or the next available port).

## Building for Production

To create a production build:

```bash
pnpm build
```

The output files will be placed in the `dist` directory.