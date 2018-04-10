document.addEventListener('DOMContentLoaded', evt => {
  // TODO: turn login/register into popups
  document.querySelector('.button#create-button').addEventListener('click', evt => {
    window.location.href = '/login';
  });
  document.querySelector('.join-button').addEventListener('click', evt => {
    window.location.href = '/login';
  });
});
