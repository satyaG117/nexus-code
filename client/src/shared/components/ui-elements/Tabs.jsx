import { useEffect, useState } from "react"

export default function Tabs({ options, defaultTab }) {
    const [selected, setSelected] = useState(0)
    useEffect(() => {
        setSelected(defaultTab);
    }, [defaultTab])

    return (
        <>
            {
                options.map((opt, index) => {
                    return (<span className={`tab-name ${selected === index && 'border-bottom border-info'} py-1 px-2`} key={index} onClick={() => { setSelected(index); opt.onClick(); }}>
                        {opt.name}
                    </span>)
                })
            }
        </>
    )
}
