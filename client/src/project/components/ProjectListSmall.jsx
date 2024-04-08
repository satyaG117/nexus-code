import ProjectCard from "./ProjectCard"

export default function ProjectListSmall({projects, handleFork, toggleLike}) {
    return (
        <div className="row row-cols-1 row-cols-lg-2 g-4 mt-5 mx-2 m-md-2 m-lg-1">
            {
                projects.map((project, index) => {
                    return (<div className="col" key={project._id}><ProjectCard project={project} onFork={handleFork} toggleLike={toggleLike} /></div>)
                })
            }
        </div>
    )
}
