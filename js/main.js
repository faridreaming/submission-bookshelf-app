const addBookModal = document.getElementById('addBookModal')
const addBookModalTrigger = document.getElementById('addBookModalTrigger')
addBookModalTrigger.addEventListener('click', () => {
  addBookModal.showModal()
})
const bookFormSubmitButton = document.getElementById('bookFormSubmit')
const bookFormSubmitButtonText = bookFormSubmitButton.querySelector('span')
const bookFormIsComplete = document.getElementById('bookFormIsComplete')
bookFormIsComplete.addEventListener('change', function () {
  bookFormSubmitButtonText.innerText = this.checked
    ? 'Sudah selesai dibaca'
    : 'Belum selesai dibaca'
})
