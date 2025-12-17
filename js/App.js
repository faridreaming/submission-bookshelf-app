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

// TEMPLATES FROM HTML
const allBookListTemplate = document.getElementById('allBookListTemplate')
const completeBookListTemplate = document.getElementById(
  'completeBookListTemplate',
)
const incompleteBookListTemplate = document.getElementById(
  'incompleteBookListTemplate',
)
const bookItemTemplate = document.getElementById('bookItemTemplate')

class App {
  static instance = null

  constructor() {
    if (App.instance) return App.instance

    this.tabs = [
      { name: 'all', title: 'Daftar Semua Buku' },
      { name: 'incomplete', title: 'Daftar Buku Belum Dibaca' },
      { name: 'complete', title: 'Daftar Buku Sudah Dibaca' },
    ]

    this.activeTab = this.tabs[0]
    this.books = []

    this.tabManager = new TabManager({
      tabs: this.tabs,
      rootElement: document.getElementById('tablist'),
      onChange: (tabName) => this.setTab(tabName),
    })

    this.tabPanel = document.querySelector('[role="tabpanel"]')

    this.tabManager.render(this.activeTab.name)
    this.renderTabcontent()

    App.instance = this
  }

  setTab(name) {
    const found = this.tabs.find((t) => t.name === name)
    if (!found) return

    this.activeTab = found
    this.tabManager.render(found.name)
    console.log(this.activeTab)

    this.renderTabcontent()
  }

  renderTabcontent() {
    this.tabPanel.innerHTML = ''

    let selectedTemplate
    if (this.activeTab.name === 'all') selectedTemplate = allBookListTemplate
    else if (this.activeTab.name === 'complete')
      selectedTemplate = completeBookListTemplate
    else selectedTemplate = incompleteBookListTemplate

    const containerClone = selectedTemplate.content.cloneNode(true)

    const listContainer = containerClone.querySelector('div')

    const filteredBooks = this.books.filter((book) => {
      if (this.activeTab.name === 'all') return true
      if (this.activeTab.name === 'complete') return book.isComplete
      if (this.activeTab.name === 'incomplete') return !book.isComplete
    })

    filteredBooks.forEach((book) => {
      const bookClone = bookItemTemplate.content.cloneNode(true)

      bookClone.querySelector('[data-testid="bookItemTitle"]').textContent =
        book.title
      bookClone.querySelector('[data-testid="bookItemAuthor"]').textContent =
        `Penulis: ${book.author}`
      bookClone.querySelector('[data-testid="bookItemYear"]').textContent =
        `Tahun: ${book.year}`

      const completeBtn = bookClone.querySelector(
        '[data-testid="bookItemIsCompleteButton"]',
      )
      completeBtn.textContent = book.isComplete
        ? 'Belum selesai dibaca'
        : 'Selesai dibaca'

      listContainer.appendChild(bookClone)
    })

    this.tabPanel.appendChild(containerClone)
  }
}

new App()
