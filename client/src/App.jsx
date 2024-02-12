import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import './App.css'
import Home from './shared/pages/Home';
import Navbar from './shared/components/navigation/Navbar';
import Login from './user/pages/Login'
import Signup from './user/pages/Signup';

function App() {

  return (
    <div id='main-container'>
      <Router>
      <Navbar />
        <Routes>
          <Route path='/' element={<Home />}/>
          <Route path='/login' element={<Login />}/>
          <Route path='/signup' element={<Signup />}/>
        </Routes>
      </Router>
    </div>
  )
}

export default App
