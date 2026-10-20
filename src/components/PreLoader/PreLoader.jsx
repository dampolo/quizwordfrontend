import "./PreLoader.scss"

function PreLoader() {
    return (
        <div className="rotate-center">
            <img width={40} height={40} src="/assets/logo.svg" alt="Loading..."/>
        </div>
    )
}

export default PreLoader