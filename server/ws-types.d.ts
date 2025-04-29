// 定义WebSocket模块的类型
declare module "ws" {
  export class WebSocket extends EventEmitter {
    static readonly CONNECTING: number;
    static readonly OPEN: number;
    static readonly CLOSING: number;
    static readonly CLOSED: number;

    binaryType: string;
    readonly bufferedAmount: number;
    readonly extensions: string;
    id?: string;
    readonly protocol: string;
    readonly readyState: number;
    readonly url: string;

    constructor(
      address: string | URL,
      protocols?: string | string[],
      options?: WebSocket.ClientOptions
    );

    close(code?: number, data?: string | Buffer): void;
    ping(data?: any, mask?: boolean, cb?: (err: Error) => void): void;
    pong(data?: any, mask?: boolean, cb?: (err: Error) => void): void;
    send(data: any, cb?: (err?: Error) => void): void;
    send(
      data: any,
      options: {
        mask?: boolean;
        binary?: boolean;
        compress?: boolean;
        fin?: boolean;
      },
      cb?: (err?: Error) => void
    ): void;

    terminate(): void;

    // EventEmitter
    on(event: string, listener: (...args: any[]) => void): this;
    once(event: string, listener: (...args: any[]) => void): this;
    off(event: string, listener: (...args: any[]) => void): this;
    addListener(event: string, listener: (...args: any[]) => void): this;
    removeListener(event: string, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: string): this;
  }

  export class WebSocketServer extends EventEmitter {
    constructor(options: WebSocketServer.ServerOptions, callback?: () => void);

    close(cb?: (err?: Error) => void): void;
    handleUpgrade(
      request: IncomingMessage,
      socket: Socket,
      upgradeHead: Buffer,
      callback: (client: WebSocket, request: IncomingMessage) => void
    ): void;

    // EventEmitter
    on(
      event: "connection",
      cb: (socket: WebSocket, request: IncomingMessage) => void
    ): this;
    on(event: "error", cb: (error: Error) => void): this;
    on(
      event: "headers",
      cb: (headers: string[], request: IncomingMessage) => void
    ): this;
    on(event: "close" | "listening", cb: () => void): this;
    on(event: string, listener: (...args: any[]) => void): this;
  }

  export namespace WebSocket {
    interface ClientOptions {
      protocol?: string;
      handshakeTimeout?: number;
      perMessageDeflate?: boolean | PerMessageDeflateOptions;
      localAddress?: string;
      headers?: { [key: string]: string };
      origin?: string;
      agent?: Agent;
      host?: string;
      family?: number;
      timeout?: number;
      maxPayload?: number;
    }

    interface PerMessageDeflateOptions {
      serverNoContextTakeover?: boolean;
      clientNoContextTakeover?: boolean;
      serverMaxWindowBits?: number;
      clientMaxWindowBits?: number;
      zlibDeflateOptions?: {
        flush?: number;
        finishFlush?: number;
        chunkSize?: number;
        windowBits?: number;
        level?: number;
        memLevel?: number;
        strategy?: number;
        dictionary?: Buffer | Buffer[] | DataView;
        info?: boolean;
      };
      threshold?: number;
      concurrencyLimit?: number;
    }
  }

  export namespace WebSocketServer {
    interface ServerOptions {
      host?: string;
      port?: number;
      backlog?: number;
      server?: Server;
      verifyClient?: VerifyClientCallbackSync | VerifyClientCallbackAsync;
      handleProtocols?: (
        protocols: string[],
        request: IncomingMessage
      ) => string | false;
      path?: string;
      noServer?: boolean;
      clientTracking?: boolean;
      perMessageDeflate?: boolean | PerMessageDeflateOptions;
      maxPayload?: number;
    }

    interface PerMessageDeflateOptions {
      serverNoContextTakeover?: boolean;
      clientNoContextTakeover?: boolean;
      serverMaxWindowBits?: number;
      clientMaxWindowBits?: number;
      zlibDeflateOptions?: {
        flush?: number;
        finishFlush?: number;
        chunkSize?: number;
        windowBits?: number;
        level?: number;
        memLevel?: number;
        strategy?: number;
        dictionary?: Buffer | Buffer[] | DataView;
        info?: boolean;
      };
      threshold?: number;
      concurrencyLimit?: number;
    }

    type VerifyClientCallbackSync = (info: {
      origin: string;
      secure: boolean;
      req: IncomingMessage;
    }) => boolean;

    type VerifyClientCallbackAsync = (
      info: { origin: string; secure: boolean; req: IncomingMessage },
      callback: (
        res: boolean,
        code?: number,
        message?: string,
        headers?: OutgoingHttpHeaders
      ) => void
    ) => void;
  }
}

import { EventEmitter } from "events";
import { Agent } from "http";
import { IncomingMessage, Server, OutgoingHttpHeaders } from "http";
import { Socket } from "net";
