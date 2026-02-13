import { RouterProvider } from "react-router";
import router from "./router/router.tsx";
import './styles/index.css'
import AlertModal from "./components/modals/AlertModal.tsx";
import { Toaster } from 'react-hot-toast'; // [추가]

function App() {
   return (
      <>
         <RouterProvider router={router} />
         <AlertModal />
         {/* [추가] 토스트 알림 컨테이너 설정 */}
         <Toaster 
            position="bottom-right"
            toastOptions={{
               className: '',
               style: {
                  background: '#333',
                  color: '#fff',
                  padding: '16px',
                  borderRadius: '16px',
                  fontSize: '14px',
                  fontWeight: 'bold',
               },
               success: {
                  style: {
                     background: '#222',
                     color: '#FFD400', // 브랜드 컬러
                  },
                  iconTheme: {
                     primary: '#FFD400',
                     secondary: '#222',
                  },
               },
               error: {
                  style: {
                     background: '#EF4444',
                     color: '#fff',
                  },
               },
            }}
         />
      </>
   );
}

export default App;
