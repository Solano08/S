import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layout/MainLayout';
import { Home, Projects, Finances, Calendar, Ideas, Assistant } from './pages';
import { AppDataProvider } from './context/AppDataContext';

function App() {
  return (
    <AppDataProvider>
      <MainLayout>
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
}

export default App;
