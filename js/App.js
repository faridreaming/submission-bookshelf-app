import TabManager from './TabManager.js'

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
    ? 'Sudah dibaca'
    : 'Belum dibaca'
})

class App {
  static instance = null

  constructor() {
    if (App.instance) return App.instance

    this.tabs = [
      { name: 'all', title: 'Daftar Semua Buku' },
      { name: 'unread', title: 'Daftar Buku Belum Dibaca' },
      { name: 'read', title: 'Daftar Buku Sudah Dibaca' },
    ]

    this.activeTab = this.tabs[0]
    this.books = []

    this.tabManager = new TabManager({
      tabs: this.tabs,
      rootElement: document.getElementById('tablist'),
      onChange: (tabName) => this.setTab(tabName),
    })

    this.tabManager.render(this.activeTab.name)

    App.instance = this
  }

  setTab(name) {
    const found = this.tabs.find((t) => t.name === name)
    if (!found) return

    this.activeTab = found
    this.tabManager.render(found.name)

    console.log('Tab berubah ke:', found.name)
  }
}

new App()
