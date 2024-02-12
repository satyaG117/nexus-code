import LoginForm from "../components/LoginForm"
import { Link } from "react-router-dom"

export default function Login() {

    return (
        <div className="col-md-4 offset-md-4 col-10 offset-1 p-3 shadow bg-dark-subtle mt-5 border-bottom border-start border-warning">
            <h2>Login</h2>
            <div className="my-2">
            <LoginForm 
            onSubmit={null}
            isLoading={false}
            />
            </div>
            Need an account ? <Link to='/signup'>signup</Link>
        </div>
    )
}
