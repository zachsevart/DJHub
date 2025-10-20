import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Upload from './components/Upload';
import Mixes from './components/Mixes';
import Feed from './components/Feed';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/mixes" element={<Mixes />} />
        <Route path="/feed" element={<Feed />} />
      </Routes>
    </Router>
  );
}
export default App;