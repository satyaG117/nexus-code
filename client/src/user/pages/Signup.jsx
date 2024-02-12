import { Link } from "react-router-dom"
import SignupForm from "../components/SignupForm"

export default function Signup() {
  return (
    <div className="col-md-4 offset-md-4 col-10 offset-1 p-3 shadow bg-dark-subtle mt-5 border-bottom border-start border-warning">
            <h2>Signup</h2>
            <div className="my-2">
                <SignupForm 
                onSubmit={null}
                isLoading={false}
                />
            </div>
            Already have an account ? <Link to='/login'>Login</Link>
        </div>
  )
}
