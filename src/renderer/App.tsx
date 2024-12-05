import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { RootContextProvider } from './context/root-context';
import { useEffect } from 'react';
import Landing from './pages/landing';
import useSuperApp from './hooks/use-super-app';
import SuperApiClient from './pages/super-api-client';
import SuperSqlClient from './pages/super-sql-client';
import './App.css';

export default function App() {
  return (
    <Router>
      <RootContextProvider>
        <Routes>
          <Route path="/" Component={SetupApp} />
        </Routes>
      </RootContextProvider>
    </Router>
  );
}

function SetupApp() {
  const { app } = useSuperApp();

  useEffect(() => {
    // load-theme
    if (localStorage.getItem('color-theme') === 'dark') {
      document.documentElement.classList.add('dark');
    }

    // change-theme from menubar
    window.electron.ipcRenderer.on('toggle-theme', () => {
      toggleTheme();
    });
  }, []);

  function toggleTheme() {
    if (localStorage.getItem('color-theme') === 'dark') {
      localStorage.setItem('color-theme', 'light');
      document.documentElement.classList.remove('dark');
    } else {
      localStorage.setItem('color-theme', 'dark');
      document.documentElement.classList.add('dark');
    }
  }

  if (app === 'super_api_client') {
    return <SuperApiClient />;
  }
  if (app == 'super_sql_client') {
    return <SuperSqlClient />;
  }

  return <Landing />;
}
