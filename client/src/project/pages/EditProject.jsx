import { useContext, useEffect, useState } from "react"
import ProjectForm from "../components/ProjectForm"
import ErrorMessage from "../../shared/components/ui-elements/ErrorMessage";
import Spinner from "../../shared/components/loading-icons/Spinner";
import { useNavigate, useParams } from "react-router-dom";
import useFetch from "../../shared/hooks/useFetch";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from "../../shared/contexts/AuthContext";

export default function EditProject() {
  const { projectId } = useParams();
  const makeRequest = useFetch();
  const [isSaving, setIsSaving] = useState(false);
  const [project, setProject] = useState(null)
  const [error, setError] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  const saveProject = async (formInputs) => {
    try {
      setIsSaving(true);
      await makeRequest(`http://localhost:5000/api/projects/${projectId}`, 'PATCH', formInputs, {
        'Content-Type' : 'application/json',
        'Authorization' : auth.token
      })
      navigate(`/projects/${projectId}`)
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsFetching(true);
        const responseData = await makeRequest(`http://localhost:5000/api/projects/${projectId}`);
        setProject(responseData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsFetching(false);
      }
    }

    fetchProject()
  }, [projectId])

  return (
    <>
      {isFetching && <Spinner overlayType={'opaque'} text="Please wait" />}
      {error && <ErrorMessage message={error} />}
      {project && (<div className="col-md-6 offset-md-3 col-10 offset-1 border border-warning mt-5 p-4">
        <h3>Edit project details</h3>
        <hr />
        <ProjectForm onSubmit={saveProject} isSubmitting={isSaving} project={project} />
      </div>)}
    </>
  )
}
