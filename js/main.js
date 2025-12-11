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
// SIDE MENU TOGGLE ------------------------------------------------


const burgerBtn = document.querySelector('.icon-btn');
const sideMenu = document.querySelector('.side-menu');
const sideMenuClose = document.querySelector('.side-menu__close');

if (burgerBtn && sideMenu) {
  burgerBtn.addEventListener('click', () => {
    sideMenu.classList.add('side-menu--open');
    burgerBtn.setAttribute('aria-expanded', 'true');
  });
}

if (sideMenu && sideMenuClose) {
  sideMenuClose.addEventListener('click', () => {
    sideMenu.classList.remove('side-menu--open');
    burgerBtn.setAttribute('aria-expanded', 'false');
    burgerBtn.focus();
  });

  sideMenu.addEventListener('click', (event) => {
    if (event.target.matches('.side-menu__link')) {
      sideMenu.classList.remove('side-menu--open');
      burgerBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

// CHATBOT / OPENAI INTEGRATION -----------------------------------

const chatForm = document.querySelector('#chat-form');
const chatInput = document.querySelector('#chat-input');
const chatMessages = document.querySelector('#chat-messages');
const chatStatus = document.querySelector('#chat-status');

let chatIsSending = false;

if (chatForm && chatInput && chatMessages) {
  chatForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const message = chatInput.value.trim();
    if (!message || chatIsSending) return;

    // Vis brukerens melding
    appendChatMessage('user', message);
    chatInput.value = '';
    chatInput.focus();

    // Sett “loading”-status
    chatIsSending = true;
    setChatStatus('loading');

    // Midlertidig boble med ...
    const loadingBubble = appendChatMessage('bot', '…');

    try {
      const reply = await askFramBot(message);
      loadingBubble.querySelector('.chat__bubble').textContent = reply;
      setChatStatus('ok');
    } catch (error) {
      console.error(error);
      loadingBubble.querySelector('.chat__bubble').textContent =
        'Sorry, the connection to FRAM was interrupted. Please try again in a moment.';
      setChatStatus('error');
    } finally {
      chatIsSending = false;
    }
  });
}

function appendChatMessage(who, text) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('chat__message');
  if (who === 'user') {
    wrapper.classList.add('chat__message--user');
  } else {
    wrapper.classList.add('chat__message--bot');
  }

  const bubble = document.createElement('p');
  bubble.classList.add('chat__bubble');
  bubble.textContent = text;

  wrapper.appendChild(bubble);
  chatMessages.appendChild(wrapper);

  // scroll til bunnen
  chatMessages.parentElement.scrollTop = chatMessages.parentElement.scrollHeight;

  return wrapper;
}

function setChatStatus(state) {
  if (!chatStatus) return;

  if (state === 'loading') {
    chatStatus.textContent = 'FRAM is thinking…';
  } else if (state === 'error') {
    chatStatus.textContent = 'Connection error – AI may be temporarily unavailable.';
  } else {
    chatStatus.textContent = '';
  }
}

/**
 * Kaller OpenAI API.
 * VIKTIG: Ikke legg ekte API-nøkkel i GitHub – bruk placeholder når du leverer.
 */
async function askFramBot(userMessage) {
  const apiKey = 'YOUR_OPENAI_API_KEY_HERE'; // bytt lokalt, ikke i repo

  if (!apiKey || apiKey === 'YOUR_OPENAI_API_KEY_HERE') {
    // “Fake” svar så UI ikke krasjer hvis nøkkel mangler
    return "I'm a demo version right now. Add an OpenAI API key to enable real answers.";
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini', // evt. 'gpt-3.5-turbo' hvis læreren sier det
      messages: [
        {
          role: 'system',
          content:
            'You are FRAM, an assistant for a Norwegian sustainable food delivery service. ' +
            'Answer questions about delivery, partner farms, sustainability and seasonal products. ' +
            'Keep answers short (2–4 sentences), friendly and clear. If users ask about health/medical issues, tell them to contact a professional.',
        },
        {
          role: 'user',
          content: userMessage,
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error('OpenAI API error: ' + response.status);
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content || '';
  return reply.trim();
}
