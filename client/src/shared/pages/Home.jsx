import { useEffect, useState } from "react";
import Spinner from "../components/loading-icons/Spinner";
import useFetch from "../hooks/useFetch";
import ProjectList from "../../project/components/ProjectList";
import useFork from "../hooks/useFork";

export default function Home() {
  const makeRequest = useFetch();
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState(null)
  const {forkProject, isForking} = useFork()
  
  const handleFork = async (projectId) => {
    try {
      await forkProject(projectId);
    } catch (err) {
      toast.error(err.message);
    }
  }

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setError(null)
        setIsLoading(true);
        const responseData = await makeRequest('http://localhost:5000/api/projects');
        setProjects(responseData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjects()

  }, [makeRequest])

  return (<>
    {isForking && <Spinner overlayType={'translucent'} text="Please wait"/>}
    {projects && (<div className="mt-5 mx-4">
      <ProjectList projects={projects} handleFork={handleFork}/>
    </div>)}
    <div className="d-flex flex-column justify-content-center align-items-center">
      {error && <h5>{error}</h5>}
      {isLoading && <Spinner />}
    </div>
  </>
  )
}
