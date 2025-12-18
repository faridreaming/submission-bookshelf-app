import TabManager from './TabManager.js'
import Book from './Book.js'

class App {
  static instance = null

  constructor() {
    if (App.instance) return App.instance

    this.addBookModal = document.getElementById('addBookModal')
    this.addBookModalTrigger = document.getElementById('addBookModalTrigger')

    this.bookFormSubmitButton = document.getElementById('bookFormSubmit')
    this.bookFormSubmitButtonText =
      this.bookFormSubmitButton.querySelector('span')
    this.bookFormIsComplete = document.getElementById('bookFormIsComplete')

    this.allBookListTemplate = document.getElementById('allBookListTemplate')
    this.completeBookListTemplate = document.getElementById(
      'completeBookListTemplate',
    )
    this.incompleteBookListTemplate = document.getElementById(
      'incompleteBookListTemplate',
    )
    this.bookItemTemplate = document.getElementById('bookItemTemplate')

    this.bindEvents()

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

  bindEvents() {
    this.addBookModalTrigger.addEventListener('click', () => {
      this.addBookModal.showModal()
    })
    this.bookFormIsComplete.addEventListener('change', (event) => {
      this.bookFormSubmitButtonText.innerText = event.target.checked
        ? 'Sudah dibaca'
        : 'Belum dibaca'
    })
  }

  setTab(name) {
    const found = this.tabs.find((t) => t.name === name)
    if (!found) return

    this.activeTab = found
    this.tabManager.render(found.name)
    console.log(this.activeTab)

    this.renderTabcontent()
  }

  createBookElement(book) {
    const bookClone = this.bookItemTemplate.content.cloneNode(true)

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

    return bookClone
  }

  getContainerTemplate() {
    if (this.activeTab.name === 'all') return this.allBookListTemplate
    if (this.activeTab.name === 'complete') return this.completeBookListTemplate
    return this.incompleteBookListTemplate
  }

  getFilteredBooks() {
    return this.books.filter((book) => {
      if (this.activeTab.name === 'all') return true
      if (this.activeTab.name === 'complete') return book.isComplete
      if (this.activeTab.name === 'incomplete') return !book.isComplete
      return false
    })
  }

  renderTabcontent() {
    this.tabPanel.innerHTML = ''

    const selectedTemplate = this.getContainerTemplate()
    const containerClone = selectedTemplate.content.cloneNode(true)
    const listContainer = containerClone.querySelector('div')
    const filteredBooks = this.getFilteredBooks()

    filteredBooks.forEach((book) => {
      listContainer.appendChild(this.createBookElement(book))
    })

    this.tabPanel.appendChild(containerClone)
  }
}

new App()
