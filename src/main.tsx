import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import GlobalErrorBoundary from './components/common/GlobalErrorBoundary' // [추가]

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        {/* [추가] 앱 전체를 에러 바운더리로 감싸기 */}
        <GlobalErrorBoundary>
          <App />
        </GlobalErrorBoundary>
      </HelmetProvider>
    </QueryClientProvider>
  </StrictMode>,
)
