import { useContext, useState } from "react"
import LoginForm from "../components/LoginForm"
import { Link, useNavigate } from "react-router-dom"
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from "../../shared/contexts/AuthContext";
import useFetch from "../../shared/hooks/useFetch";

import '../../shared/stylesheets/GradientBG.css'


export default function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const auth = useContext(AuthContext);
    const makeRequest = useFetch();
    const navigate = useNavigate();

    const handleLogin = async (formInputs) => {
        console.log(formInputs)
        setIsLoading(true);
        try {
            const responseData = await makeRequest('http://localhost:5000/api/users/login', 'POST', formInputs, {
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
        <div className="gradient-background" style={{flex : 1}}>
            <div className="col-md-4 offset-md-4 col-10 offset-1 p-3 shadow bg-info-subtle mt-5">
                <h2>Login</h2>
                <div className="my-2">
                    <LoginForm
                        onSubmit={handleLogin}
                        isLoading={isLoading}
                    />
                </div>
                Need an account ? <Link to='/signup'>signup</Link>
            </div>
        </div>
    )
}
