// Chrome Extension API Types
declare global {
  interface ChromeTab {
    id?: number;
    url?: string;
    title?: string;
  }

  interface ChromeTabsQueryInfo {
    active?: boolean;
    currentWindow?: boolean;
  }

  interface ChromeMessage {
    action: string;
    content?: string;
    data?: any;
  }

  interface ChromeResponse {
    success?: boolean;
    data?: any;
    error?: string;
  }
}

// Chrome Extension API Types
declare global {
  var chrome: any;
}

declare namespace chrome {
  namespace tabs {
    function query(queryInfo: any, callback: (tabs: ChromeTab[]) => void): void;
    function sendMessage(tabId: number, message: any): Promise<any>;
    const onUpdated: {
      addListener(callback: (tabId: number, changeInfo: any, tab: ChromeTab) => void): void;
    };
  }

  namespace scripting {
    function executeScript(injection: {
      target: { tabId: number };
      files: string[];
    }): Promise<any[]>;
  }

  namespace runtime {
    const onMessage: {
      addListener(callback: (message: any, sender: any, sendResponse: (response: any) => void) => boolean): void;
    };
    function sendMessage(message: any, callback?: (response: any) => void): void;
  }

  namespace storage {
    function get(keys: string | string[], callback: (result: any) => void): void;
    function set(items: any, callback?: () => void): void;
  }
}

export {};