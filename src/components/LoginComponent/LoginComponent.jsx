import './LoginComponent.css';
import appleIcon from '../../img/apple.svg';
import facebookIcon from '../../img/facebook.png';
import googleIcon from '../../img/google.jfif';

function LoginComponent() {
  return (
    <>
        <div className="login-background">
            <div className="login-container">
                <h2>Inicia Sesión</h2>
                <form className="login-form">
                <label>Email</label>
                <input type="email" placeholder="Ingrese su email" />
                <label>Contraseña</label>
                <input type="password" placeholder="Ingrese su contraseña" />

                <div className="login-buttons">
                    <button type="submit">Inicia Sesión</button>
                    <button type="button" className="link-btn">¿Olvidaste tu contraseña?</button>
                </div>
                </form>

                <hr />

                <p>O usa alguna de estas opciones</p>
                <div className="login-icons">
                <img src={appleIcon} alt="Apple login" />
                <img src={facebookIcon} alt="Facebook login" />
                <img src={googleIcon} alt="Google login" />
                </div>

                <div className="extra-buttons">
                <button className="secondary">Regístrate</button>
                <button className="secondary">Inicia como Bañeario</button>
                </div>
            </div>
        </div>
    </>
    
  );
}

export default LoginComponent;
