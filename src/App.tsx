import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layout/MainLayout';
import { Home, Projects, Finances, Calendar, Ideas, Assistant } from './pages';
import { AppDataProvider } from './context/AppDataContext';
import { PWAInstaller } from './components/PWAInstaller';

// #region agent log
const log = (location: string, message: string, data: any) => {
  fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location,
      message,
      data,
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1'
    })
  }).catch(() => {});
};
// #endregion

function App() {
  // #region agent log
  log('App.tsx:render', 'App component renderizando', {
    hypothesisId: 'B',
    timestamp: Date.now()
  });
  // #endregion
  
  try {
    return (
      <AppDataProvider>
        <MainLayout>
          <PWAInstaller />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/finances" element={<Finances />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/ideas" element={<Ideas />} />
            <Route path="/assistant" element={<Assistant />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </AppDataProvider>
    );
  } catch (error) {
    // #region agent log
    log('App.tsx:error', 'ERROR en App component', {
      hypothesisId: 'B',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    // #endregion
    throw error;
  }
}

export default App;
