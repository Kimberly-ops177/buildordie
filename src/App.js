import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BuildOrDie from './pages/BuildOrDie';
import BuildOrDieAuth from './pages/BuildOrDieAuth';
import BuildOrDieDashboard from './pages/BuildOrDieDashboard';
import BuildOrDieWall from './pages/BuildOrDieWall';
import BuildOrDieSprints from './pages/BuildOrDieSprints';
import BuildOrDieArena from './pages/BuildOrDieArena';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BuildOrDie />} />
        <Route path="/auth" element={<BuildOrDieAuth />} />
        <Route path="/dashboard" element={<BuildOrDieDashboard />} />
        <Route path="/wall" element={<BuildOrDieWall />} />
        <Route path="/sprints" element={<BuildOrDieSprints />} />
        <Route path="/arena" element={<BuildOrDieArena />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;