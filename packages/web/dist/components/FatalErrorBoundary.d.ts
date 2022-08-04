/// <reference types="react" />
/// <reference types="react" />
declare type State = {
    hasError: boolean;
    error?: Error;
};
declare type PropsFatalErrorBoundary = {
    children?: React.ReactNode;
    page: React.ComponentType<{
        error?: Error;
    }>;
};
declare class FatalErrorBoundary extends React.Component<PropsFatalErrorBoundary, State> {
    state: {
        hasError: boolean;
        error: undefined;
    };
    static getDerivedStateFromError(error: Error): {
        hasError: boolean;
        error: Error;
    };
    render(): React.ReactNode;
}
export default FatalErrorBoundary;
//# sourceMappingURL=FatalErrorBoundary.d.ts.map