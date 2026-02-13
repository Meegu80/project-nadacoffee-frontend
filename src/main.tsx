import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// React Query 클라이언트 초기화
const queryClient = new QueryClient();

// 앱 렌더링 및 전역 Provider 설정
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
