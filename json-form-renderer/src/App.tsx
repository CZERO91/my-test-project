import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ImportPage from './pages/ImportPage';
import RendererPage from './pages/RendererPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ImportPage />} />
        <Route path="/renderer" element={<RendererPage />} />
      </Routes>
    </Router>
  );
}

export default App;
