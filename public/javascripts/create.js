document.addEventListener('DOMContentLoaded', evt => {
  Array.prototype.forEach.call(document.querySelectorAll('.close-button'),
    close => close.addEventListener('click', evt => {
      console.log(close.parentNode);
      document.querySelector('#overlay').classList.add('hidden');
      close.parentNode.classList.add('hidden');
      close.parentNode.querySelector('form').reset();
  }));

  document.querySelector('.button#create-button').addEventListener('click', evt => {
    document.querySelector('#create-form').classList.remove('hidden');
    document.querySelector('#overlay').classList.remove('hidden');
    document.querySelector('#create-game').addEventListener('click', createGame);
  });

  Array.prototype.forEach.call(document.querySelectorAll('.join-button'),
    button => button.addEventListener('click', evt => {
      const form = document.querySelector('#join-form > form');
      const game = button.parentNode.parentNode;
      const details = getGameDetails(game);
      const hidden = document.createElement('div');
      hidden.classList.add('slug');
      hidden.classList.add('hidden');
      hidden.setAttribute('value', game.getAttribute('id'));
      form.append(hidden);
      form.insertBefore(details, form.firstChild);

      const title = document.createElement('h3');
      title.innerText = game.getAttribute('value');
      form.insertBefore(title, form.firstChild);
      document.querySelector('#join-form').classList.remove('hidden');
      document.querySelector('#overlay').classList.remove('hidden');
      document.querySelector('#join-game').addEventListener('click', joinGame);
  }));
});

function getGameDetails(game) {
  const details = document.createElement('div');
  const clonedDetails = game.querySelector('.details').cloneNode(true);
  details.append(clonedDetails);
  if (game.classList.contains('password')) {
    const password = document.createElement('div');
    password.setAttribute('id', 'password');
    const label = document.createElement('label');
    label.innerText = 'Password';
    const input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.setAttribute('name', 'password');
    input.addEventListener('keypress', evt => {
      if (evt.keyCode === 13) {
        evt.preventDefault();
      }
    });
    password.append(label);
    password.append(input);
    details.insertBefore(password, clonedDetails);
  }
  return details;
}

function joinGame(evt) {
  const form = this.parentNode.parentNode;
  const details = form.querySelector('.details');

  const gameObj = {};
  gameObj.slug = form.querySelector('.slug').getAttribute('value');
  gameObj.mode = details.querySelector('.mode').innerText;
  gameObj.decks = details.querySelector('.decks').innerText.slice(0, 1);

  gameObj.users = [];
  Array.prototype.forEach.call(details.querySelector('.users').children,
  child => {
    if (!child.classList.contains('count')) {
      gameObj.users.push(child.innerText);
    }
  });

  const password = form.querySelector('#password > input');
  if (password) {
    if (password.value === '') {
      const wrapper = document.createElement('div');
      const message =  document.createElement('div');
      message.innerText = 'Enter the password.';
      message.setAttribute('id', 'error');
      wrapper.append(message);
      wrapper.style.justifyContent = 'center';
      document.querySelector('#join-form h3').after(wrapper);
      return;
    } else {
      gameObj.password = password.value;
    }
  }

  fetch('/join', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    credentials: 'same-origin',
    body: JSON.stringify(gameObj)
  }).then(response => {
    if (response.status === 303) { // error
      const error = document.querySelector('#error');
      if (error) { // remove old error
        error.parentNode.remove();
      }
      response.json().then(data => {
        const wrapper = document.createElement('div');
        const message =  document.createElement('div');
        message.innerText = data.message;
        message.setAttribute('id', 'error');
        wrapper.append(message);
        wrapper.style.justifyContent = 'center';
        document.querySelector('#join-form h3').after(wrapper);
      });
    } else {
      form.querySelector('.slug').remove();
      details.remove();
      document.querySelector('#overlay').classList.add('hidden');
      this.removeEventListener('click', joinGame);
      const error = document.querySelector('#error');
      if (error) {
        error.parentNode.remove(); // wrapper
      }

      window.location.href = response.url;
    }
  }).catch(err => console.log(err));
}

function createGame(evt) {
  //reference: https://developer.mozilla.org/en-US/docs/Web/API/FormData/Using_FormData_Objects
  const form = document.querySelector('#create-form > form')
  const game = new FormData(form);
  const gameObj = {};
  for (let [key, val] of game.entries()) {
    gameObj[key] = val;
  }

  //reference: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
  fetch('/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'same-origin',
    redirect: 'error',
    body: JSON.stringify(gameObj)
  }).then(response => {
    console.log(response.status);
    if (response.status === 303) { // error
      response.json().then(data => {
        const wrapper = document.createElement('div');
        const message =  document.createElement('div');
        message.innerText = data.message;
        message.setAttribute('id', 'error');
        wrapper.append(message);
        wrapper.style.justifyContent = 'center';
        document.querySelector('#create-form h3').after(wrapper);
      });
    } else {
      form.reset();
      document.querySelector('#create-form').classList.add('hidden');
      document.querySelector('#overlay').classList.add('hidden');
      this.removeEventListener('click', createGame);
      const error = document.querySelector('#error');
      if (error) {
        error.parentNode.remove();
      }
      window.location.href = response.url;
    }
  }).catch(err => console.log('hello', err));

}
