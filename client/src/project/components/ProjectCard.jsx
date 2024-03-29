import { Link } from "react-router-dom"

import './ProjectCard.css'
import LikeButton from "../../shared/components/ui-elements/LikeButton"


export default function ProjectCard({ project, toggleLike}) {
    const restrictiveCSS = '*{pointer-events: none;transition: none;animation: none;overflow:hidden;}'

    

    return (
        <Link to={`/projects/${project._id}`} className="card-link">
            <div className="card shadow bg-primary-subtle project-card">
                <div className="my-2 d-flex px-2">
                    <Link to={`/profile/${project.author._id}`} className="btn">{project.author.username}</Link>


                </div>
                <div>
                    <iframe
                        srcDoc={`<body>${project.code.html}</body><style>${restrictiveCSS}\n${project.code.css}</style>`}
                        title="output"
                        width="100%"
                        id="output-iframe"
                    />
                </div>
                <div className="m-2">
                    <h5>{project.title}</h5>
                    {project.forkedFrom && (<><small>Forked from </small> <Link to={`/projects/${project.forkedFrom}`}>See original</Link></>)}
                    <div className="my-3">
                        {/* different buttons like star and fork go here */}
                        <LikeButton onClick={toggleLike} projectId={project._id} isLiked={project.isLiked} likesCount={project.likesCount}/>
                        {/* <button className="btn btn-sm btn-secondary me-2" onClick={() => onFork(project._id)}>Fork</button> */}

                    </div>

                    {/* <p className="desc">{project.description}</p> */}
                </div>

            </div>
        </Link>
    )
}
