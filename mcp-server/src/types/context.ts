export interface Context {
  // socket?: any; // Removed, no longer used
  sendBrowserAction(type: string, payload: any, target?: 'content' | 'background'): Promise<any>; // Updated method
  wait(ms: number): Promise<void>;
  getBrowserState(): Promise<{ connected: boolean; url?: string; title?: string }>; // More specific return type
  // executeBrowserAction(action: string, params: any): Promise<any>; // Removed, use sendBrowserAction directly
  isConnected(): boolean; 
}