import { Routes, Route } from 'react-router-dom';
import './App.css';
import { navigationRoutes } from './navigation';

function App() {
  return (
    <Routes>
      {navigationRoutes.map(route => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
    </Routes>
  );
}

export default App;
