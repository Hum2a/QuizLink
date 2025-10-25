import { Routes, Route } from 'react-router-dom';
import './App.css';
import './styles/themes.css';
import { navigationRoutes } from './navigation';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Routes>
        {navigationRoutes.map(route => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Routes>
    </ThemeProvider>
  );
}

export default App;
