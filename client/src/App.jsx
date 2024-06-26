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
import AuthenticatedOnlyRoutes from './shared/components/protected-routes/AuthenticatedOnlyRoutes';
import NewProject from './project/pages/NewProject';
import ViewProject from './project/pages/ViewProject';
import EditProject from './project/pages/EditProject';
import ProjectEditor from './project/pages/ProjectEditor';
import Profile from './user/pages/Profile';
import SearchProjects from './project/pages/SearchProjects';
import ProjectCollab from './project/pages/ProjectCollab';
import UserInvites from './user/pages/UserInvites';
import LandingPage from './shared/pages/LandingPage';
import ViewSourceCode from './project/pages/ViewSourceCode';

function App() {
  const { userId, token, username, role, login, logout } = useAuth();


  return (
    <div id='main-container'>
      <AuthContext.Provider
        value={{
          isLoggedIn: !!token,
          userId,
          token,
          username,
          role,
          login,
          logout
        }}

      >
        <Router>
          <Navbar />
          <Routes>
            <Route path='/' element={<LandingPage />} />
            <Route path='/home' element={<Home />} />
            <Route path='/projects/:projectId' element={< ViewProject />} />
            <Route path='/profile/:userId' element={< Profile />} />
            <Route path='/search' element={< SearchProjects />} />
            <Route path='/projects/:projectId/source-code' element={<ViewSourceCode />} />

            <Route element={<AuthenticatedOnlyRoutes allowedRoles={['user']} redirectTo={'/login'} />}>
              <Route path='/projects/create' element={<NewProject />} />
              <Route path='/projects/:projectId/edit' element={<EditProject />} />
              <Route path='/projects/:projectId/editor' element={<ProjectEditor />} />
              <Route path='/projects/:projectId/collaboration' element={<ProjectCollab />} />
              <Route path='/user/invites' element={<UserInvites />} />
            </Route>

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
