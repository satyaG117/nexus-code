import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import useFetch from '../../shared/hooks/useFetch';
import { useContext, useState } from 'react';
import { AuthContext } from '../../shared/contexts/AuthContext';
// import Spinner from '../../shared/components/loading-icons/Spinner';
import ProjectForm from '../components/ProjectForm';
import '../../shared/stylesheets/GradientBG.css'

export default function NewProject() {
  const makeRequest = useFetch();
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const saveProject = async (formInputs) => {
    try {
      setIsLoading(true)
      const responseData = await makeRequest('http://localhost:5000/api/projects', 'POST', formInputs, {
        'Content-Type': 'application/json',
        'Authorization': auth.token
      })

      navigate(`/projects/${responseData._id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className='gradient-background' style={{flex : 1}}>
      <div className="col-md-6 offset-md-3 col-10 offset-1 mt-5 p-4 bg-info-subtle">
        <h3>Start a new project</h3>
        <hr />
        <ProjectForm onSubmit={saveProject} isSubmitting={isLoading} projectData={null} />
      </div>
    </div>
  )
}
