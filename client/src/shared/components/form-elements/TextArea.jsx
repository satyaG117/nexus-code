export default function TextArea({ placeholder, register, name, rules, error, rows = 3 }) {
    return (
        <>
            <textarea className="form-control text-input" placeholder={placeholder} name={name} id={name} rows={rows} {...register(name, rules)}>

            </textarea>
            {error && (<small className="error-msg text-warning">{error.message}</small>) }
        </>


    )
}
