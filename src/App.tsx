import { BrowserRouter as Router } from 'react-router-dom';
import AppRouter from './router/AppRouter';
import { CartProvider } from './stores/CartContext';
import { AuthProvider } from './stores/authStore';
import { ThemeProvider } from './stores/themeStore';
import { LayoutProvider } from './stores/layoutStore';
import { ModalProvider } from './stores/ModalStore';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <CartProvider>
            <LayoutProvider>
              <ModalProvider>
                <AppRouter />
              </ModalProvider>
            </LayoutProvider>
          </CartProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
