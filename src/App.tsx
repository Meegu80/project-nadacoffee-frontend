import { RouterProvider } from "react-router";
import router from "./router/router.tsx";
import './styles/index.css'
import AlertModal from "./components/modals/AlertModal.tsx";

function App() {
   // 렌더링 파트============================================================================================================
   return (
      <>
         <RouterProvider router={router} />
         <AlertModal />
      </>
   );
}

export default App;
