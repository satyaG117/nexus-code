import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { ToastContainer } from 'react-toastify';

import './App.css'
import Home from './shared/pages/Home';
import Navbar from './shared/components/navigation/Navbar';
import Login from './user/pages/Login'
import Signup from './user/pages/Signup';
import { AuthContext } from './shared/contexts/AuthContext';
import { useAuth } from './shared/hooks/useAuth';
import UnauthenticatedOnlyRoutes from './shared/components/protected-routes/UnauthenticatedOnlyRoutes'


function App() {
  const { userId, token, role, login, logout } = useAuth();


  return (
    <div id='main-container'>
      <AuthContext.Provider
        value={{
          isLoggedIn: !!token,
          userId,
          token,
          role,
          login,
          logout
        }}

      >
        <Router>
          <Navbar />
          <Routes>
            <Route path='/' element={<Home />} />

            <Route element={<UnauthenticatedOnlyRoutes />}>
              <Route path='/login' element={<Login />} />
              <Route path='/signup' element={<Signup />} />
            </Route>
          </Routes>
        </Router>
      </AuthContext.Provider>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  )
}

export default App
