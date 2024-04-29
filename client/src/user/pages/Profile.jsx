import { useContext, useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import useFetch from "../../shared/hooks/useFetch";

import './Profile.css'
import { AuthContext } from "../../shared/contexts/AuthContext";
import ErrorMessage from '../../shared/components/ui-elements/ErrorMessage'
import Spinner from '../../shared/components/loading-icons/Spinner'
import ProjectList from "../../project/components/ProjectList";
import ProjectListSmall from "../../project/components/ProjectListSmall";

export default function Profile() {
  const auth = useContext(AuthContext)
  const { userId } = useParams();
  const makeRequest = useFetch();
  const [user, setUser] = useState(null)
  const [selectedTab, setSelectedTab] = useState(0);
  const [projects, setProjects] = useState([]);
  const [userError, setUserError] = useState(null);
  const [projectError, setProjectError] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [isProjectLoading, setIsProjectLoading] = useState(false);
  const [page, setPage] = useState(1);

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


  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsUserLoading(true);
        const responseData = await makeRequest(`http://localhost:5000/api/users/${userId}`);
        setUser(responseData);
        console.log(responseData);
      } catch (err) {
        setUserError(err.message);
        console.log(err);
      } finally {
        setIsUserLoading(false);
      }
    }

    fetchUser()
  }, [userId])



  const fetchProjects = async () => {
    try {
      setProjectError(null)
      setIsProjectLoading(true)
      let responseData;
      if (selectedTab == 0) {
        responseData = await makeRequest(`http://localhost:5000/api/projects/user/${userId}?page=${page}`, 'GET', null, {
          'Authorization': auth.token
        })
      } else if (selectedTab == 1) {
        responseData = await makeRequest(`http://localhost:5000/api/projects/user/${userId}/liked?page=${page}`, 'GET', null, {
          'Authorization': auth.token
        })
      }
      console.log(responseData)
      setProjects(prev => [...prev, ...responseData])
      setPage(prev => prev + 1)

    } catch (err) {
      console.log(err)
      setProjectError(err.message);
    } finally {
      setIsProjectLoading(false);

    }
  }

  useEffect(() => {
    setProjects([]);
    setPage(1);
  }, [selectedTab])

  useEffect(() => {
    if (page == 1) {
      fetchProjects();
    }
  }, [page])

  return (
    <>
      {isUserLoading && <Spinner overlayType={'opaque'} text="Please wait" />}
      {userError && <ErrorMessage message={userError} />}

      {user && (
        <div className="mt-4 col-md-10 offset-md-1 col-10 offset-1 row">
          <div className="col-lg-4 col-md-5 p-2">
            <div className="row mb-3">
              <div className="col-md-4 col-2">
                <img className='profile-pic' src="https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D" alt="" />
              </div>
              <div className="col-md-7 col-8">
                <h4>{user.username}</h4>
                <div><strong>{user.projectCount}</strong> Projects</div>
              </div>
            </div>
            {auth.userId === userId && (<div>
              <button className="btn btn-sm btn-light me-2">Edit Profile</button>
              <button className="btn btn-sm btn-danger" onClick={auth.logout}>Logout</button>
              <div className="my-3">
                <Link type="button" className="btn btn-sm btn-primary position-relative" to={'/user/invites'}>
                  Invites
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {user.inviteCount}
                    <span className="visually-hidden">Pending invites</span>
                  </span>
                </Link>
              </div>

            </div>)}
          </div>
          <div className="col-lg-8 p-2">
            <div className="mb-2">
              <span className={`tab-name ${selectedTab == 0 && 'border-bottom border-info'} py-1 px-2`} onClick={() => { setSelectedTab(0) }}>Projects</span>
              <span className={`tab-name ${selectedTab == 1 && 'border-bottom border-info'} py-1 px-2`} onClick={() => { setSelectedTab(1) }}>Likes</span>

            </div>
            <div className="">
              {projects && <ProjectListSmall projects={projects} toggleLike={toggleLike} />}
              {isProjectLoading && (<div className="py-5 text-center"><Spinner /></div>)}
              {projectError && <div className="mt-4 text-secondary">{projectError}</div>}
              <div className="my-3 text-center">
                {/* <p className="me-3">{page}</p> */}
                {page > 1 && <button className="btn btn-light" onClick={fetchProjects}>Load More</button>}
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  )
}
