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
import LikeButton from "../../shared/components/ui-elements/LikeButton";

const themes = ['info', 'danger', 'warning', 'success']

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
                const responseData = await makeRequest(`http://localhost:5000/api/projects/${projectId}`, 'GET', null, {
                    'Authorization': auth.token
                });
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

    const toggleLikeState = () => {
        setProjectData((prevState) => {
            if (prevState.isLiked) {
                return { ...prevState, isLiked: false, likesCount: prevState.likesCount - 1 }
            } else {
                return { ...prevState, isLiked: true, likesCount: prevState.likesCount + 1 }
            }
        })
    }

    const toggleLike = async () => {
        try {
            // optimistic update
            toggleLikeState();
            await makeRequest(`http://localhost:5000/api/projects/${projectId}/like`, 'POST', null, {
                'Authorization': auth.token
            });
        } catch (err) {
            toast.error(err.message)
            toggleLikeState();
        }
    }

    return (
        <>
            {isDeleting && <Spinner overlayType={'translucent'} />}
            {isForking && <Spinner overlayType={'translucent'} text="Please wait" />}
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
                <div className="container my-3">
                    <div className="row">
                        <div className="col-lg-6">
                            <div className="bg-primary-subtle px-4 py-3 d-flex">
                                <div className="me-auto">
                                    <h4>{projectData.title}</h4>
                                    <Link to={`/profile/${projectData.author._id}`} className="btn btn-sm btn-outline-light">{projectData.author.username}</Link>
                                    {projectData.forkedFrom && (<div><small>Forked from </small> <Link to={`/projects/${projectData.forkedFrom}`}>See original</Link></div>)}
                                </div>
                                {projectData.author._id === auth.userId && (
                                    <div className="ms-auto">
                                        <div className="dropdown">
                                            <button className="btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" className="bi bi-three-dots-vertical" viewBox="0 0 16 16">
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
                        </div>
                        <div className="col-lg-6">
                            <div className="bg-primary-subtle p-3">
                                <div className="d-flex">
                                    <Link to={`/projects/${projectId}/editor`} className="btn btn-light me-2">Open in Editor</Link>
                                    <span className="me-2"><LikeButton isLiked={projectData.isLiked} onClick={toggleLike} projectId={projectData._id} likesCount={projectData.likesCount} /></span>
                                    <button className="btn btn-secondary me-2" onClick={handleFork}>Fork</button>
                                    <Link className="btn btn-light" to={`/projects/${projectId}/source-code`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-code-slash" viewBox="0 0 16 16">
                                            <path d="M10.478 1.647a.5.5 0 1 0-.956-.294l-4 13a.5.5 0 0 0 .956.294zM4.854 4.146a.5.5 0 0 1 0 .708L1.707 8l3.147 3.146a.5.5 0 0 1-.708.708l-3.5-3.5a.5.5 0 0 1 0-.708l3.5-3.5a.5.5 0 0 1 .708 0m6.292 0a.5.5 0 0 0 0 .708L14.293 8l-3.147 3.146a.5.5 0 0 0 .708.708l3.5-3.5a.5.5 0 0 0 0-.708l-3.5-3.5a.5.5 0 0 0-.708 0" />
                                        </svg>
                                    </Link>

                                </div>
                                <hr />
                                {projectData.description &&
                                    <>
                                        <p className="mb-3">{projectData.description}</p>
                                        <hr />
                                    </>

                                }


                                <div className="">
                                    <div className="d-flex">

                                        <h5 className="me-auto">Collaborators : </h5>
                                        {auth.userId === projectData.author._id && <Link to={`/projects/${projectId}/collaboration`} className="btn btn-sm btn-light ms-auto"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" class="bi bi-gear-fill" viewBox="0 0 16 16">
                                            <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z" />
                                        </svg></Link>}
                                    </div>
                                    <div>
                                        <Link to={`/profile/${projectData.author._id}`} className="btn btn-sm border">{projectData.author.username} (Author)</Link>
                                    </div>
                                    {
                                        projectData.contributors.length > 0 && projectData.contributors.map((contributor, index) => {
                                            return (
                                                <div key={index} className="my-2">
                                                    <Link to={`/profile/${contributor._id}`} className="btn btn-sm border">{contributor.username}</Link>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                                <hr />


                                <div className="">
                                    <p>Created at : {projectData.createdAt.toLocaleString()}</p>
                                    <p>Last edited at : {projectData.lastEditedAt.toLocaleString()}</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>


            )
            }
        </>
    )
}
