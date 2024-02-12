import './Spinner.css'

export default function Spinner({overlay=false}) {

    if (overlay) {
        return (
            <div className='overlay'>
                <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        )
    } else {
        return (
            <div className="spinner-border text-warning" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        )

    }

}
