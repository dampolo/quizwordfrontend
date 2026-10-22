import { Outlet } from "react-router-dom";
import Header from "../components/Header/header";
import Footer from "../components/Footer/footer";
import "./PublicLayout.scss";

function PublicLayout() {
  return (
    <>
      <Header />
        <Outlet />
      <Footer />
    </>
  );
}

export default PublicLayout;