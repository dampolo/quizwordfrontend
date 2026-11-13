import "./PreLoader.scss"

function PreLoader({ label = "Loading..." }) {
    return (
        <div className="rotate-center">
            <img width={40} height={40} src="/assets/logo.svg" alt={label}/>
        </div>
    )
}

export default PreLoader
