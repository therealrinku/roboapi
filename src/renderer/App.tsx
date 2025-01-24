import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { RootContextProvider } from './context/root-context';
import { useEffect } from 'react';
import ApiClient from './pages/api-client';
import './app.css';

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
  useEffect(() => {
    // load-theme
    if (localStorage.getItem('color-theme') === 'dark') {
      document.documentElement.classList.add('dark');
    }

    // change-theme from menubar
    // window.electron.ipcRenderer.on('toggle-theme', () => {
    //   toggleTheme();
    // });
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

  return <ApiClient />;
}
