import ProjectCard from "./ProjectCard"


export default function ProjectList({ projects , handleFork , toggleLike}) {
    return (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-5 mt-3 mx-2 m-md-2 m-lg-1">
            {
                projects.map((project, index) => {
                    return (<div className="col" key={project._id}><ProjectCard project={project} onFork={handleFork} toggleLike={toggleLike} /></div>)
                })
            }
        </div>
    )
}
