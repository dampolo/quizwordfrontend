import { useNavigate, Link } from "react-router-dom";
import AuthContext from "../../../context/AuthContext";
import "./dialog-customer.scss";
import { useContext } from "react";

function DialogCustomer({ setIsProfileVisible }) {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  function openProfile(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsProfileVisible(false);
    navigate("/my-quiz/profile/");
  }

  async function logOut() {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <section className="profile">
      <ul>
        <li>
          <button onClick={openProfile}>
            <img width={25} height={25} src="/assets/profile.svg" alt="" />
            Profil
          </button>
        </li>
        <li>
          <button type="button" onClick={logOut}>
            <img width={25} height={25} src="/assets/log-out.svg" alt="" />
            Log out
          </button>
        </li>
        <li>
          <Link to="/my-quiz/settings">
            <img width={25} height={25} src="/assets/settings.svg" alt="" />
            Einstellungen
          </Link>
        </li>
      </ul>
    </section>
  );
}

export default DialogCustomer;
