/**
 * NOTE: This module should not contain any nodejs functionality,
 * because it's also used by Storybook in the browser.
 */
import React from 'react';
export declare const mockAuthClient: {
    restoreAuthState: () => void;
    login: () => void;
    logout: () => void;
    signup: () => void;
    getToken: () => string;
    getUserMetadata: () => Record<string, unknown> | null;
    client: string;
    type: string;
};
export declare const MockProviders: React.FunctionComponent;
//# sourceMappingURL=MockProviders.d.ts.map