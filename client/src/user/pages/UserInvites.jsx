import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../../shared/contexts/AuthContext"
import useFetch from "../../shared/hooks/useFetch";
import InviteCard from '../components/InviteCard';
import Spinner from '../../shared/components/loading-icons/Spinner'
import ErrorMessage from '../../shared/components/ui-elements/ErrorMessage'
import {toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";

export default function UserInvites() {
    const auth = useContext(AuthContext);
    const makeRequest = useFetch();
    const [invites, setInvites] = useState(null);
    const [isInvitesLoading , setIsInvitesLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null)
    const navigate = useNavigate();

    useEffect(()=>{
        const fetchInvites = async()=>{
            try{
                setIsInvitesLoading(true);
                setError(null)
                const responseData = await makeRequest(`http://localhost:5000/api/invites/user/${auth.userId}`, 'GET' , null, {
                    'Authorization' : auth.token
                })
                console.log(responseData);
                setInvites(responseData)
            }catch(err){
                setError(err.message);
            }finally{
                setIsInvitesLoading(false)
            }
        }
        
        if(!auth.isLoggedIn) return;
        fetchInvites();

    },[])

    const removeInvite = (inviteId)=>{
        setInvites(prevInvites => prevInvites.filter(invite => invite._id !== inviteId))
    }

    const acceptInvite = async(inviteId, projectId)=>{
        try{
            setIsLoading(true);
            await makeRequest(`http://localhost:5000/api/invites/${inviteId}`, 'POST', null, {
                'Authorization' : auth.token
            })
            removeInvite(inviteId)
            navigate(`/projects/${projectId}`);
        }catch(err){
            toast.error(err.message);
        }finally{
            setIsLoading(false);
        }
    }

    const rejectInvite = async(inviteId)=>{
        try{
            setIsLoading(true);
            await makeRequest(`http://localhost:5000/api/invites/${inviteId}`, 'DELETE', null, {
                'Authorization' : auth.token
            })
            toast.success('Invite rejected')
            removeInvite(inviteId)
        }catch(err){
            toast.error(err.message);
        }finally{
            setIsLoading(false);
        }
    }



    return (
        <div className="p-3 mt-3 col-md-8">
            {isLoading && <Spinner overlayType={'translucent'}/>}
            
            <h3>Pending invites</h3>
            {isInvitesLoading && <div className="text-center mt-5">
                <Spinner/>
                </div>}
            <div className="my-3">
                {invites && invites.map((invite)=>{
                    return <InviteCard invite={invite} onAccept={acceptInvite} onReject={rejectInvite} key={invite._id}/>
                })}
                {!invites && error && (<ErrorMessage message={error}/>)}
                {invites?.length === 0 && !error && (<p>No pending invites</p>)}
            </div>
        </div>
    )
}
