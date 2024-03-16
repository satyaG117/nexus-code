import { useForm } from "react-hook-form"
import TextArea from "../../shared/components/form-elements/TextArea"
import TextInput from "../../shared/components/form-elements/TextInput"
import Spinner from "../../shared/components/loading-icons/Spinner"
import { useEffect } from "react";

export default function ProjectForm({ onSubmit, projectData, isSubmitting }) {
    
    const { register, handleSubmit, formState: { errors }, setValue} = useForm();

    useEffect(()=>{
        if(!projectData) return;

        setValue('title', projectData.title);
        setValue('description', projectData.description);
    },[projectData])

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className='mb-3'>
                <label htmlFor="title" className='form-label'>Enter a title for project</label>
                <TextInput
                    name={"title"}
                    placeholder={"Title"}
                    type={"text"}
                    register={register}
                    rules={{
                        required: 'Title is required',
                    }}
                    error={errors.title}
                />
            </div>
            <div className='mb-3'>
                <label htmlFor="description" className='form-label'>Enter a description for project</label>
                <TextArea
                    name={"description"}
                    placeholder={"Description"}
                    register={register}
                    error={errors.description}
                    rows={5}
                />
            </div>
            <button className='btn btn-warning' disabled={isSubmitting} >{isSubmitting ? <Spinner color="dark"/> : 'Submit'}</button>
        </form>
    )
}
