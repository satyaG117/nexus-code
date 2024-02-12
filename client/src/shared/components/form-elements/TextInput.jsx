import './TextInput.css'

export default function TextInput({placeholder , type , register , name , rules , error}) {
  return (
    <>
        <input 
        placeholder={placeholder}
        className="form-control text-input"
        type={type}
        id={name}
        {...register(name , rules)}
        />
        {error && (<small className="error-msg text-warning">{error.message}</small>) }
    </>
  )
}
