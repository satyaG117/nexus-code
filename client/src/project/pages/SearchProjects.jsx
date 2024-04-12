import { useForm } from "react-hook-form"
import ProjectSearchFilters from "../components/ProjectSearchFilters";
import ProjectList from '../components/ProjectList';
import { useContext, useState } from "react";
import { AuthContext } from "../../shared/contexts/AuthContext";
import useFetch from "../../shared/hooks/useFetch";
import Spinner from "../../shared/components/loading-icons/Spinner";


export default function SearchProjects() {
  const [projects, setProjects] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const auth = useContext(AuthContext);
  const makeRequest = useFetch();

  const toggleLikeState = (projectId) => {
    setProjects((prevState) => {
      return prevState.map((p) => {
        if (p._id == projectId) {
          if (p.isLiked) {
            return { ...p, isLiked: false, likesCount: p.likesCount - 1 }
          } else {
            return { ...p, isLiked: true, likesCount: p.likesCount + 1 }
          }
        }
    
        return p
      });
    });
  }

  const toggleLike = async (projectId) => {
    console.log(projectId);
    try {
      // optimistic update
      toggleLikeState(projectId);
      await makeRequest(`http://localhost:5000/api/projects/${projectId}/like`, 'POST', null, {
        'Authorization' : auth.token
      });
    } catch (err) {
      toast.error(err.message)
      toggleLikeState(projectId);
    }
  }
  
  const handleSearch = async(formInput)=>{
    console.log(formInput)
    try{
      setIsLoading(true);
      setError(null);
      const responseData = await makeRequest(`http://localhost:5000/api/projects/search?searchTerm=${formInput.searchTerm}&sortBy=${formInput.sortBy}&includeForks=${formInput.includeForks}&page=${1}&limit=${6}`, 'GET', null, {
        'Authorization' : auth.token
      });
      setProjects(responseData);
    }catch(err){
      console.log(err);
      setError(err.message)
    }finally{
      setIsLoading(false);
    }
  }
  return (
    <>
      <div className="mt-4 mx-3"><ProjectSearchFilters onSubmit={handleSearch}/></div>
      <div className="mt-3">
        {projects && <ProjectList projects={projects} toggleLike={toggleLike}/>}
        {isLoading && <div className="m-auto"><Spinner /></div>}
        {error && <div className="text-center mt-4">{error}</div>}
      </div>
    </>
  )
}
