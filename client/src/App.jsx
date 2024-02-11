import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import './App.css'
import Home from './shared/pages/Home';
import Navbar from './shared/components/navigation/Navbar';

function App() {

  return (
    <div id='main-container'>
      <Router>
      <Navbar />
        <Routes>
          <Route path='/' element={<Home />}/>
        </Routes>
      </Router>
    </div>
  )
}

export default App
