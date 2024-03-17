
export default function ErrorMessage({ message = 'Some error occured' }) {
    const reloadPage = () => {
        window.location.reload();
    }
    return (
        <div className="mt-5 d-flex flex-column justify-content-center align-items-center">
            <h5>{message}</h5>
            <div>
                <button className="btn btn-light" onClick={reloadPage}>Reload</button>

            </div>
        </div>
    )
}
