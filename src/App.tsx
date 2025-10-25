import { Routes, Route } from 'react-router-dom';
import './App.css';
import './styles/themes.css';
import { navigationRoutes } from './navigation';
import { ThemeProvider } from './contexts/ThemeContext';
import { AchievementProvider } from './contexts/AchievementContext';
import { RecommendationProvider } from './contexts/RecommendationContext';

function App() {
  return (
    <ThemeProvider>
      <AchievementProvider>
        <RecommendationProvider>
          <Routes>
            {navigationRoutes.map(route => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </Routes>
        </RecommendationProvider>
      </AchievementProvider>
    </ThemeProvider>
  );
}

export default App;
