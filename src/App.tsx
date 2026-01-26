import { RouterProvider } from "react-router";
import router from "./router/router.tsx";
import './styles/index.css'

function App() {
   // 렌더링 파트============================================================================================================
   return <RouterProvider router={router} />;
}

export default App;
