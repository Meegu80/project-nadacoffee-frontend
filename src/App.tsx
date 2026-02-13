import { RouterProvider } from "react-router";
import router from "./router/router.tsx";
import './styles/index.css'
import AlertModal from "./components/modals/AlertModal.tsx";

function App() {
   // 라우터 및 전역 알림 모달 렌더링
   return (
      <>
         <RouterProvider router={router} />
         <AlertModal />
      </>
   );
}

export default App;
