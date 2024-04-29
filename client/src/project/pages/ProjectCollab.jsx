import { useContext, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './ProjectCollab.css'
import ContributorCard from "../components/ContributorCard"
import useFetch from "../../shared/hooks/useFetch"
import { AuthContext } from "../../shared/contexts/AuthContext"
import { useParams } from "react-router-dom"
import Spinner from "../../shared/components/loading-icons/Spinner"
import TextInput from "../../shared/components/form-elements/TextInput"
import UserResultCard from "../components/UserResultCard"
import ProjectInviteCard from "../components/ProjectInviteCard";

export default function ProjectCollab() {
    const { projectId } = useParams();
    const [project, setProject] = useState(null)
    const [invites, setInvites] = useState([])
    const [isProjectLoading, setIsProjectLoading] = useState(false)
    const [isInvitesLoading, setIsInvitesLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const makeRequest = useFetch();
    const auth = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const { register, watch } = useForm();

    useEffect(() => {
        const fetchProject = async () => {
            try {
                // setError(null)
                setIsProjectLoading(true);
                const responseData = await makeRequest(`http://localhost:5000/api/projects/${projectId}`, 'GET', null, {
                    'Authorization': auth.token
                });
                setProject(responseData)
                console.log(responseData)
            } catch (err) {
                // setError(err.message)
            } finally {
                setIsProjectLoading(false);
            }
        }

        const fetchInvites = async () => {
            try {
                // setError(null)
                setIsInvitesLoading(true);
                const responseData = await makeRequest(`http://localhost:5000/api/invites/project/${projectId}`, 'GET', null, {
                    'Authorization': auth.token
                });
                setInvites(responseData)
                console.log(responseData)
            } catch (err) {
                // setError(err.message)
            } finally {
                setIsInvitesLoading(false);
            }
        }

        fetchProject();
        fetchInvites();
        
    }, [projectId, makeRequest, auth.token])
    

    const setUserFlag = (users) => {
        console.log(project);
        if(!project) return;
        const updatedUsers =  users.map((user) => {
            if (user._id === project.author._id || invites.some(i => i.user._id === user._id) || project.contributors.some(c => c._id === user._id)) {
                return { ...user, inviteAllowed: false };
            }
            return { ...user, inviteAllowed: true };
        })

        console.log(updatedUsers)
        return updatedUsers

    }

   

    const cancelInvite = async(inviteId)=>{
        try{
            setIsLoading(true)
            await makeRequest(`http://localhost:5000/api/invites/${inviteId}`, 'DELETE' , null, {
                'Authorization' : auth.token
            });
            setInvites(invites.filter(i => i._id !== inviteId));
            toast.success('Invite cancelled')
        }catch(err){
            toast.error(err.message);
        }finally{
            setIsLoading(false);
        }
    }

    useEffect(() => {
        const fetchUsers = async (searchTerm) => {
            console.log("fetch users")
            try {
                const responseData = await makeRequest(`http://localhost:5000/api/users/search?searchTerm=${searchTerm}`);
                console.log(responseData)
                setUsers(setUserFlag(responseData));
    
            } catch (err) {
                console.log(err);
            }
        }
        const subscription = watch((value, { name, type }) => {
            // console.log(value);
            if(value === "") return;
            fetchUsers(value.searchTerm)
        }
        )
        return () => subscription.unsubscribe()
    }, [watch])

    const sendInvite = async (userId) => {
        try {
            setIsLoading(true)
            const responseData = await makeRequest(`http://localhost:5000/api/invites`, 'POST', {
                projectId: projectId,
                userId: userId
            }, {
                'Authorization': auth.token,
                'Content-Type': 'application/json'
            })
            setInvites(prev => [responseData, ...prev]);
            toast.success('Invited successfully')
        } catch (err) {
            toast.error(err.message)
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="container mt-3">
            {isLoading && <Spinner overlayType={'translucent'} />}
            <div className="row">
                <div className="col-lg-6 p-2 mb-5">
                    <h3>Current Contributors</h3>
                    {project?.contributors?.length > 0 ? <>
                        {project.contributors.map((c, index) => {
                            return <ContributorCard username={c.username} userId={c._id} key={c._id} />
                        })}
                    </> :
                        <div className="text-center my-3">
                            {isProjectLoading ? <Spinner /> : 'No contributors'}
                        </div>

                    }

                </div>
                <div className="col-lg-6 p-2">
                    <div className="mb-2">
                        <h3>Send invites</h3>
                        <div>
                            <TextInput
                                placeholder={'Search user'}
                                type="text"
                                register={register}
                                name={'searchTerm'}
                            />
                        </div>
                    </div>
                    <div className="">

                        {users.length > 0 && <div className="p-2 shadow user-search-results bg-dark">
                            {users.map((user) => {
                                return <UserResultCard user={user} key={user._id} onSend={sendInvite} />
                            })}
                        </div>}
                        <h3 className="">Pending Invites</h3>
                        {invites.length > 0 ?
                            <>
                                {invites.map((invite, index) => {
                                    return <ProjectInviteCard invite={invite} onDelete={cancelInvite}/>
                                })}
                            </> :
                            <div className="text-center my-3">
                                {isInvitesLoading ? <Spinner /> : 'No pending invites'}
                            </div>
                        }
                    </div>
                </div>

            </div>
        </div>


    )
}
