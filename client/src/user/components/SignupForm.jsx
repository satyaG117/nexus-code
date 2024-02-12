import { useForm } from 'react-hook-form';
import Spinner from '../../shared/components/loading-icons/Spinner';
import TextInput from '../../shared/components/form-elements/TextInput';

export default function SignupForm({onSubmit, isLoading}) {
    const { register, handleSubmit, formState: { errors }, getValues, setError } = useForm();

    const validateRetypedPassword = (value) => {
        const password = getValues("password")

        if (value !== password) {
            // console.log("Not equal")
            setError('retypedPass', {
                type: 'manual',
                message: 'Passwords do not match',
            });
            // console.log(errors)
            return false;
        }
        return true;
    }
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className='mb-3'>
                <TextInput
                    name={"username"}
                    placeholder={"Username"}
                    type={"text"}
                    register={register}
                    rules={{
                        required: 'Username is required',
                        pattern: {
                            value: /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i,
                            message: 'Username should be according to github username conventions'
                        }
                    }}
                    error={errors.username}
                />
            </div>
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
                        },
                        maxLength: {
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
            <div className='mb-3'>
                <TextInput
                    name={"retypedPass"}
                    placeholder={"Retype Password"}
                    type={"password"}
                    register={register}
                    rules={{
                        // required : 'Retyped password cannot be empty',
                        validate: { validateRetypedPassword }
                    }}
                    error={errors.retypedPass}
                />
                {/* workaround for error message not showing up */}
                {errors.retypedPass && (<small className="error-msg text-warning">Retyped password should match password</small>)}


            </div>



            <button className=' my-3 btn btn-light' disabled={isLoading} >{isLoading ? <Spinner /> : 'Submit'}</button>
        </form>
    )
}
