
export default function UserResultCard({ user, onSend }) {
    return (
        <div className="border p-2 my-2 d-flex" >
            <div className="me-auto">
                <p className="mb-1">{user.username}</p>
                <small className="text-secondary">{user._id}</small>
            </div>
            <div className="ms-auto">
                {user.inviteAllowed && <button className="btn btn-sm btn-warning" onClick={() => onSend(user._id)}>Send</button>}
            </div>
        </div>
    )
}
