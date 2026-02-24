import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import type { FallbackProps } from 'react-error-boundary';
import Button from './Button';

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-brand-white">
            <div className="glass p-10 rounded-3xl max-w-md w-full text-center space-y-6">
                <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-premium font-bold text-brand-dark">문제가 발생했습니다.</h2>
                    <p className="text-gray-500 text-sm break-words">
                        {error instanceof Error ? error.message : "예기치 못한 오류가 발생하여 페이지를 불러올 수 없습니다."}
                    </p>
                </div>
                <Button
                    variant="secondary"
                    fullWidth
                    onClick={resetErrorBoundary}
                    className="font-premium"
                >
                    다시 시도하기
                </Button>
            </div>
        </div>
    );
};

interface GlobalErrorBoundaryProps {
    children: React.ReactNode;
}

const GlobalErrorBoundary: React.FC<GlobalErrorBoundaryProps> = ({ children }) => {
    return (
        <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => {
                // 에러 초기화 시 수행할 로직 (예: API 캐시 초기화 등)
                window.location.reload();
            }}
        >
            {children}
        </ErrorBoundary>
    );
};

export default GlobalErrorBoundary;
