import { useContext, useState } from "react"
import useFetch from "./useFetch"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../contexts/AuthContext";

export default function useFork() {
    const [isForking, setIsForking] = useState(false);
    const makeRequest = useFetch();
    const navigate = useNavigate();
    const auth = useContext(AuthContext);

    const forkProject = async(projectId)=>{
        try{
            setIsForking(true);
            const responseData = await makeRequest(`http://localhost:5000/api/projects/${projectId}/fork`, 'POST', null, {
                'Authorization' : auth.token
            })
            navigate(`/projects/${responseData.forkId}`);
        }catch(err){
            throw new Error(err.message);
        }finally{
            setIsForking(false);
        }
    }
    return {forkProject, isForking};
}
