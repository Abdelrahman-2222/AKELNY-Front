declare global {
  const google: {
    accounts: {
      id: {
        initialize: (config: any) => void;
        prompt: (callback?: (notification: any) => void) => void;
        renderButton: (element: HTMLElement, config: any) => void;
      };
    };
  };
}

export {};
