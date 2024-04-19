import { useContext, useEffect, useState } from "react";
import Spinner from "../components/loading-icons/Spinner";
import useFetch from "../hooks/useFetch";
import ProjectList from "../../project/components/ProjectList";
import useFork from "../hooks/useFork";
import { AuthContext } from "../contexts/AuthContext";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  const makeRequest = useFetch();
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([])
  const [page, setPage] = useState(1);
  const { forkProject, isForking } = useFork()
  const auth = useContext(AuthContext);

  const handleFork = async (projectId) => {
    try {
      await forkProject(projectId);
    } catch (err) {
      toast.error(err.message);
    }
  }

  const fetchProjects = async () => {
    try {
      setError(null)
      setIsLoading(true);
      const responseData = await makeRequest(`http://localhost:5000/api/projects?page=${page}&limit=${6}`, 'GET', null, {
        'Authorization': auth.token
      });
      setProjects(prev => [...prev ,...responseData])
      console.log(responseData)
      setPage(prev => prev + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

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
        'Authorization': auth.token
      });
    } catch (err) {
      toast.error(err.message)
      toggleLikeState(projectId);
    }
  }

  return (<>
    {isForking && <Spinner overlayType={'translucent'} text="Please wait" />}
    {projects && (<div className="mt-5 mx-4">
      <ProjectList projects={projects} handleFork={handleFork} toggleLike={toggleLike} />
    </div>)}
    <div className="d-flex flex-column justify-content-center align-items-center">
      {error && <h5>{error}</h5>}
      {isLoading && <Spinner />}
    </div>
    <div className="my-3 text-center">
      <button className="btn btn-light" onClick={fetchProjects}>Load more</button>
    </div>
  </>
  )
}
