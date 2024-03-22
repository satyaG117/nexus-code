import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom"
import './ViewProject.css'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import useFetch from "../../shared/hooks/useFetch";
import Spinner from "../../shared/components/loading-icons/Spinner";
import { AuthContext } from "../../shared/contexts/AuthContext";
import ErrorMessage from "../../shared/components/ui-elements/ErrorMessage";
import Modal from "../../shared/components/ui-elements/Modal";
import useFork from "../../shared/hooks/useFork";

export default function ViewProject() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const makeRequest = useFetch();
    const [isLoading, setIsLoading] = useState(false);
    const [projectData, setProjectData] = useState(null);
    const [error, setError] = useState(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const auth = useContext(AuthContext);
    const { forkProject, isForking } = useFork()


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
    }, [projectId, makeRequest]);

    const deleteProject = async () => {
        try {
            closeDeleteModal();
            setIsDeleting(true)
            await makeRequest(`http://localhost:5000/api/projects/${projectId}`, 'DELETE', null, {
                'Authorization': auth.token
            })
            navigate('/')
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsDeleting(false);
        }
    }

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
    }

    const openDeleteModal = () => {
        setIsDeleteModalOpen(true);
    }

    const handleFork = async () => {
        try {
            await forkProject(projectId);
        } catch (err) {
            toast.error(err.message);
        }
    }

    return (
        <>
            {isDeleting && <Spinner overlayType={'translucent'} />}
            {isForking && <Spinner overlayType={'translucent'} text="Please wait"/>}
            <Modal
                visible={isDeleteModalOpen}
                title='Confirm Action !!'
                onClose={closeDeleteModal}
            >
                <div className="my-2">
                    <p>Do you really want to delete this project ? The action is irreversible</p>
                    <div className="mt-1">
                        <button className="me-2 btn btn-light" onClick={closeDeleteModal}>No</button>
                        <button className="btn btn-outline-danger" onClick={deleteProject}>Yes</button>
                    </div>
                </div>
            </Modal>
            {isLoading && (<Spinner overlayType="opaque" text="Please wait..." />)}
            {error &&
                <ErrorMessage message={error} />
            }
            {projectData && (
                <div className="shadow mt-4 col-md-6 offset-md-3 col-10 offset-1 bg-primary-subtle">
                    <div className="bg-primary-subtle px-4 py-3 d-flex">
                        <div className="me-auto">
                            <h4>{projectData.title}</h4>
                            <Link to={`/profile/${projectData.author._id}`} className="btn btn-sm btn-outline-light">{projectData.author.username}</Link>
                            {projectData.forkedFrom && (<div><small>Forked from </small> <Link to={`/projects/${projectData.forkedFrom}`}>See original</Link></div>)}
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
                                        <li><button className="dropdown-item" onClick={openDeleteModal}>Delete</button></li>

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
                    <div className="d-flex p-2 py-3 border">
                        <Link to={`/projects/${projectId}/editor`} className="btn btn-light me-2">Open in Editor</Link>
                        <button className="btn btn-secondary me-2" onClick={handleFork}>Fork</button>
                        <button className="btn btn-light">Like</button>
                    </div>
                    <div className="p-2">
                        <p className="mb-3">{projectData.description}</p>
                        <p>Created at : {projectData.createdAt.toLocaleString()}</p>
                        <p>Last edited at : {projectData.lastEditedAt.toLocaleString()}</p>
                    </div>
                </div>
            )
            }
        </>
    )
}
