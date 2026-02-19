import React, { Component, ErrorInfo, ReactNode } from 'react';
import { MdErrorOutline, MdRefresh, MdHome } from 'react-icons/md';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 [Global Error]:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-12 text-center border border-red-50">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <MdErrorOutline size={48} />
            </div>
            
            <h2 className="text-2xl font-black text-brand-dark mb-4">앗! 문제가 발생했습니다</h2>
            <p className="text-gray-500 font-medium mb-8 leading-relaxed">
              예상치 못한 오류가 발생하여 페이지를 표시할 수 없습니다. 
              잠시 후 다시 시도해주세요.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-brand-dark text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-black transition-all"
              >
                <MdRefresh size={20} /> 페이지 새로고침
              </button>
              <button
                onClick={this.handleReset}
                className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
              >
                <MdHome size={20} /> 홈으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      );
    }

    // [수정] this.children -> this.props.children
    return this.props.children;
  }
}

export default GlobalErrorBoundary;
