export default function CheckBox({ register, name }) {
    return (
        <input className="form-check-input" {...register(name, {})} type="checkbox" id={name}/>

    )
}