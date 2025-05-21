import './ContactSection.css';
import xIcon from '../../img/x_icon.avif';
import instagramIcon from '../../img/Instagram_logo.webp';
import linkedinIcon from '../../img/LinkedIn_icon.png';
import promoImage from '../../img/promoImage.png';

function ContactSection() {
  return (
    <section className="contact-section">
      <h2>Quienes somos</h2>
      <div className="team">
        <div className="member">
          <p>Lucas Benezra</p>
          <img src={linkedinIcon} alt="LinkedIn" className="linkedin" />
        </div>
        <div className="member">
          <p>Elias Brodsky</p>
          <img src={linkedinIcon} alt="LinkedIn" className="linkedin" />
        </div>
        <div className="member">
          <p>David Chinski</p>
          <img src={linkedinIcon} alt="LinkedIn" className="linkedin" />
        </div>
      </div>

      <h2>Cómo contactarnos</h2>
      <div className="contact-methods">
        <img src={promoImage} alt="Promo" className="promo-img" />
        <div className="socials">
          <img src={xIcon} alt="X" className="social" />
          <img src={instagramIcon} alt="Instagram" className="social" />
          <img src={linkedinIcon} alt="LinkedIn" className="social" />
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
