import { Link } from 'react-router-dom'
import './LandingPage.css'
import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'

export default function LandingPage() {
    const auth = useContext(AuthContext)
    return (
        <div class="background">
            <div className='text-content-container d-flex flex-column justify-content-center align-items-center'>
                <h1 className='name text-content'>NEXUS CODE</h1>
                <h2 className='text-content'>Create &#183; Collaborate &#183; Share</h2>
                <div className='mt-3'>
                    {auth.isLoggedIn ? <Link className='btn btn-grad' to={'/home'}>Home</Link> : <Link className='btn btn-grad'to={'/login'}>Login</Link>}
                </div>
            </div>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
        </div>
    )
}
