console.log("FRAM is running ✅");
// CONTACT FORM VALIDATION ----------------------------------------

const contactForm = document.querySelector('#contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', function (event) {
    event.preventDefault(); // hindrer faktisk sending

    let isValid = true;

    // rydde gamle feilmeldinger
    const errorElems = contactForm.querySelectorAll('.contact-form__error');
    errorElems.forEach(elem => elem.textContent = '');

    const successElem = document.querySelector('#contact-success');
    if (successElem) {
      successElem.textContent = '';
    }

    // hente felter
    const nameInput = document.querySelector('#contact-name');
    const emailInput = document.querySelector('#contact-email');
    const topicSelect = document.querySelector('#contact-topic');
    const messageTextarea = document.querySelector('#contact-message');

    // navn
    if (!nameInput.value.trim()) {
      setError('contact-name', 'Please enter your name.');
      isValid = false;
    }

    // e-post (enkel sjekk)
    if (!emailInput.value.trim()) {
      setError('contact-email', 'Please enter your e-mail address.');
      isValid = false;
    } else if (!emailInput.value.includes('@')) {
      setError('contact-email', 'Please enter a valid e-mail address.');
      isValid = false;
    }

    // topic
    if (!topicSelect.value) {
      setError('contact-topic', 'Please choose a topic.');
      isValid = false;
    }

    // melding
    if (!messageTextarea.value.trim()) {
      setError('contact-message', 'Please write a short message.');
      isValid = false;
    }

    if (isValid) {
      if (successElem) {
        successElem.textContent = 'Thank you! Your message has been sent.';
      }
      contactForm.reset();
    }
  });

  function setError(inputId, message) {
    const errorElem = contactForm.querySelector(
      `.contact-form__error[data-for="${inputId}"]`
    );
    if (errorElem) {
      errorElem.textContent = message;
    }
  }
}
