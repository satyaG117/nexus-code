import './Overlay.css'

export default function Spinner({overlayType=null , text='', color='warning'}) { // overlay options : none, translucent, opaque

    if (overlayType) {
        return (
            <div className={`overlay overlay-${overlayType}`}>
                <div className={`spinner-border text-${color}`} role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <h5>{text}</h5>
            </div>
        )
    } else {
        return (
            <div className={`spinner-border text-${color}`} role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        )

    }

}
