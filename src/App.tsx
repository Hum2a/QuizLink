import { Routes, Route } from 'react-router-dom';
import './App.css';
import './styles/themes.css';
import { navigationRoutes } from './navigation';
import { ThemeProvider } from './contexts/ThemeContext';
import { AchievementProvider } from './contexts/AchievementContext';

function App() {
  return (
    <ThemeProvider>
      <AchievementProvider>
        <Routes>
          {navigationRoutes.map(route => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </AchievementProvider>
    </ThemeProvider>
  );
}

export default App;
