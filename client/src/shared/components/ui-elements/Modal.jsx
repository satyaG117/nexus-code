import ReactDOM from 'react-dom'
import './Modal.css'

export default function Modal(props) {
    if (!props.visible) return null

    return ReactDOM.createPortal(
        <>
            <div className='modal-overlay' onClick={props.onClose}>
                <div className="card my-modal p-3">
                    <div className='row'>
                        <h4 className="card-title col-10">{props.title}</h4>
                        <button className='col-2 btn btn-sm' onClick={props.onClose}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                            </svg>

                        </button>
                    </div>
                    <hr />
                    {props.children}
                </div>
            </div>

        </>,
        document.getElementById('modal-root')

    )
}