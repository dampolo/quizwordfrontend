import BackButton from "../../components/BackButton/BackButton";
import PageTitle from "../../components/PageTitle/PageTitle";
import "./contact.scss";

function Contact() {

    return(
        <main className="contact-main">
            <PageTitle title="Kontakt" />
            <BackButton to="/" className="back-button" />
            <h1 className="title">Kontakt</h1>
        </main>
    )
    
}

export default Contact