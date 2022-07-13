import React from 'react';
import { TrailingSlashesTypes } from './util';
export interface LocationContextType {
    pathname: string;
    search?: string;
    hash?: string;
}
declare const LocationContext: React.Context<LocationContextType | undefined>;
interface LocationProviderProps {
    location?: {
        pathname: string;
        search?: string;
        hash?: string;
    };
    trailingSlashes?: TrailingSlashesTypes;
}
declare class LocationProvider extends React.Component<LocationProviderProps> {
    static contextType: React.Context<LocationContextType | undefined>;
    HISTORY_LISTENER_ID: string | undefined;
    state: {
        context: {
            pathname: any;
            search: any;
            hash: any;
        };
    };
    getContext(): {
        pathname: any;
        search: any;
        hash: any;
    };
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): JSX.Element;
}
declare const useLocation: () => LocationContextType;
export { LocationProvider, LocationContext, useLocation };
//# sourceMappingURL=location.d.ts.map