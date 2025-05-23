import './Footer.css'
import Logo from "../../assets/LogoPraiar.png";

function Footer() {

return (
  <footer>
    <div class="footer_main">
        <div class="logo_section">
            <img src={Logo} alt='LogoPraiarFooter' class="logo_footer"/>
            <p class='slogan_footer'>Empeza el verano realmente <span>Praiando</span></p>
        </div>
        <div class="enlaces_section">
            <h4>Enlaces</h4>
            <ul>
                <li></li>
                <li></li>
            </ul>
        </div>
        <div class="balnearios_section">

        </div>
        <div class="contacto_section">

        </div>
    </div>
    <div class='footer_bottom'>

    </div>
  </footer>
)
}

export default Footer
