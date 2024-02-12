import { useForm } from "react-hook-form"
import TextInput from "../../shared/components/form-elements/TextInput";
import Spinner from "../../shared/components/loading-icons/Spinner";

export default function LoginForm({onSubmit, isLoading}) {
    const { register, handleSubmit, formState: { errors } } = useForm();

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className='mb-3'>
                <TextInput
                    name={"email"}
                    placeholder={"Email"}
                    type={"email"}
                    register={register}
                    rules={{
                        required: 'Email is required',
                        pattern: {
                            value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
                            message: 'Invalid email address'
                        }
                    }}
                    error={errors.email}
                />
            </div>
            <div className='mb-3'>
                <TextInput
                    name={"password"}
                    placeholder={"Password"}
                    type={"password"}
                    register={register}
                    rules={{
                        required: 'Password is required',
                        minLength: {
                            value: 8,
                            message: 'Password should be atleast 8 characters long'
                        }, maxLength: {
                            value: 128,
                            message: 'Password cannot exceed 128 characters'
                        },
                        pattern: {
                            value: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,128}$/,
                            message: 'Password must have one uppercase, one lowercase alphabet, one digit and one special character'
                        },
                    }}
                    error={errors.password}
                />
            </div>


            <button className=' my-3 btn btn-light' disabled={isLoading} >{isLoading ? <Spinner /> : 'Submit'}</button>
        </form>
    )
}
