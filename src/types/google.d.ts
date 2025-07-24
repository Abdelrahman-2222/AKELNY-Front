// declare global {
//   const google: {
//     accounts: {
//       id: {
//         initialize: (config: any) => void;
//         prompt: (callback?: (notification: any) => void) => void;
//         renderButton: (element: HTMLElement, config: any) => void;
//       };
//     };
//   };
// }
//
// export {};

declare global {
  interface Window {
    google?: typeof google;
  }

  var google: {
    accounts: {
      id: {
        initialize: (config: GoogleIdConfiguration) => void;
        prompt: (momentListener?: (promptMoment: PromptMomentNotification) => void) => void;
        renderButton: (parent: HTMLElement, options: GsiButtonConfiguration) => void;
        disableAutoSelect: () => void;
        storeCredential: (credentials: { id: string; password: string }) => void;
        cancel: () => void;
      };
    };
  };

  interface GoogleIdConfiguration {
    client_id: string;
    callback: (response: CredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    context?: string;
    state_cookie_domain?: string;
    ux_mode?: string;
    login_uri?: string;
    native_callback?: (response: any) => void;
    intermediate_iframe_close_callback?: () => void;
    itp_support?: boolean;
  }

  interface CredentialResponse {
    credential: string;
    select_by: string;
  }

  interface GsiButtonConfiguration {
    type?: 'standard' | 'icon';
    theme?: 'outline' | 'filled_blue' | 'filled_black';
    size?: 'large' | 'medium' | 'small';
    text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
    shape?: 'rectangular' | 'pill' | 'circle' | 'square';
    logo_alignment?: 'left' | 'center';
    width?: number;
    locale?: string;
  }

  interface PromptMomentNotification {
    isDisplayMoment: () => boolean;
    isDisplayed: () => boolean;
    isNotDisplayed: () => boolean;
    getNotDisplayedReason: () => string;
    isSkippedMoment: () => boolean;
    getSkippedReason: () => string;
    isDismissedMoment: () => boolean;
    getDismissedReason: () => string;
  }
}

export {};
