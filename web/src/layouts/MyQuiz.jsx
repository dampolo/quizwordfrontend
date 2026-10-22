import { Outlet } from "react-router-dom";
import Footer from "../components/Footer/footer";
import "./PublicLayout.scss";
import HeaderCustomer from "../quiz/my-quiz/HeaderCustomer/header-customer";
import NavbarCustomer from "../quiz/my-quiz/NavbarCustomer/navbar-customer";

function MyQuiz() {

	return (
	  <>
	  <main className="main-customer">
      <HeaderCustomer />

      <div className="main-content">
        <NavbarCustomer />
          <Outlet />
      </div>
    </main>
      <Footer />
	  </>
  );
}

export default MyQuiz;
