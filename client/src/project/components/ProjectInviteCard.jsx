import { Link } from "react-router-dom"

export default function ProjectInviteCard({invite, onDelete}) {
  return (
    <div className="p-2 my-2 shadow bg-primary-subtle d-flex">
            <div className="me-auto">
                <Link to={`/profile/${invite.user._id}`} className="btn border border-white">{invite.user.username}</Link>
            </div>

            <button className="btn btn-sm btn-light" onClick={()=> onDelete(invite._id)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                </svg>
            </button>
        </div>
  )
}
