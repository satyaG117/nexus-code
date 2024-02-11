import { NavLink } from "react-router-dom"

export default function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg bg-dark-subtle">
            <div className="container-fluid">
                <span className="navbar-brand" >NEUXS CODE</span>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
                    <div className="navbar-nav">
                        <NavLink className='nav-link' end to='/'>Home</NavLink>
                        <NavLink className='nav-link' end to='/search'>Search</NavLink>
                        <NavLink className='nav-link' end to='/create'>Create</NavLink>
                    
                    </div>
                    <div className="navbar-nav ms-auto">
                        <NavLink className='nav-link' end to='/login'>Login</NavLink>
                    </div>
                </div>
            </div>
        </nav>
    )
}
