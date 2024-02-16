import { Link, useNavigate } from "react-router-dom"
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useContext, useState } from "react"

import { AuthContext } from "../../shared/contexts/AuthContext";
import useFetch from "../../shared/hooks/useFetch";
import SignupForm from "../components/SignupForm"


export default function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const auth = useContext(AuthContext);
  const makeRequest = useFetch();
  const navigate = useNavigate();

  const handleSignup = async (formInputs) => {
    delete formInputs.retypedPass;
    console.log(formInputs)
    setIsLoading(true);
    try {
      const responseData = await makeRequest('http://localhost:5000/api/users/signup', 'POST', formInputs, {
        'Content-Type': 'application/json'
      })

      auth.login(responseData.userId, responseData.token);
      const nextURL = location.state?.from?.pathname || '/';
      navigate(nextURL, { replace: true });
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="col-md-4 offset-md-4 col-10 offset-1 p-3 shadow bg-dark-subtle mt-5 border-bottom border-start border-warning">
      <h2>Signup</h2>
      <div className="my-2">
        <SignupForm
          onSubmit={handleSignup}
          isLoading={isLoading}
        />
      </div>
      Already have an account ? <Link to='/login'>Login</Link>
    </div>
  )
}
