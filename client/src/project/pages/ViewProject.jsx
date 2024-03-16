import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom"
import './ViewProject.css'
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

import useFetch from "../../shared/hooks/useFetch";
import Spinner from "../../shared/components/loading-icons/Spinner";
import { AuthContext } from "../../shared/contexts/AuthContext";

export default function ViewProject() {
    const { projectId } = useParams();
    const makeRequest = useFetch();
    const [isLoading, setIsLoading] = useState(false);
    const [projectData, setProjectData] = useState(null);
    const [error, setError] = useState(null)
    const auth = useContext(AuthContext);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                setError(null)
                setIsLoading(true);
                const responseData = await makeRequest(`http://localhost:5000/api/projects/${projectId}`);
                setProjectData(responseData)
                console.log(responseData)
            } catch (err) {
                setError(err.message)
            } finally {
                setIsLoading(false);
            }
        }
        fetchProject();
    }, [projectId]);

    return (
        <>
            {isLoading && (<Spinner overlayType="opaque" text="Please wait..." />)}
            {error &&
                <div className="mt-5 text-center">
                    <h4 className="text-secondary">{error}</h4>
                </div>
            }
            {projectData && (
                <div className="shadow mt-4 col-md-6 offset-md-3 col-10 offset-1">
                    <div className="bg-primary-subtle px-4 py-3 d-flex">
                        <div className="me-auto">
                            <h4>{projectData.title}</h4>
                            <Link to={`/profile/${projectData.author._id}`}>{projectData.author.username}</Link>
                        </div>
                        {projectData.author._id === auth.userId && (
                            <div className="ms-auto">
                                <div className="dropdown">
                                    <button className="btn btn-light" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                                            <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" />
                                        </svg>
                                    </button>
                                    <ul className="dropdown-menu">
                                        <li><Link to={`/projects/${projectId}/edit`} className="dropdown-item">Edit</Link></li>
                                        <li><button className="dropdown-item">Delete</button></li>

                                    </ul>
                                </div>

                            </div>)}
                    </div>
                    <div>
                        <iframe
                            srcDoc={projectData.code ? `<body>${projectData.code.html}</body><style>${projectData.code.css}</style><script>${projectData.code.js}</script>` : ''}
                            id="output-iframe"
                            title="output"
                            sandbox="allow-scripts"
                            width="100%"
                        // height="100%"
                        />
                    </div>
                    <div className="d-flex m-2">
                        <Link to={`/projects/${projectId}/editor`} className="btn btn-light">Open in Editor</Link>
                    </div>
                </div>
            )
            }
        </>
    )
}
