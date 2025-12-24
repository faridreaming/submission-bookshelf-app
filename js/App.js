import TabManager from './TabManager.js'
import Book from './Book.js'
import BookManager from './BookManager.js'

const html = (strings, ...values) => String.raw({ raw: strings }, ...values)

class App {
  static instance = null

  constructor() {
    if (App.instance) return App.instance

    this.addBookModal = document.getElementById('addBookModal')
    this.addBookModalTrigger = document.getElementById('addBookModalTrigger')
    this.bookForm = document.getElementById('bookForm')

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
    this.bookManager = new BookManager()

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

    this.bookForm.addEventListener('submit', (event) => this.addBook(event))
  }

  addBook(event) {
    event.preventDefault()

    const title = document.getElementById('bookFormTitle').value
    const author = document.getElementById('bookFormAuthor').value
    const year = parseInt(document.getElementById('bookFormYear').value)
    const isComplete = this.bookFormIsComplete.checked

    const newBook = new Book(
      crypto.randomUUID(),
      title,
      author,
      year,
      isComplete,
    )
    this.bookManager.addBook(newBook)

    this.renderTabcontent()

    event.target.reset()
    this.addBookModal.close()
    this.bookFormSubmitButtonText.innerText = 'Belum dibaca'
  }

  setTab(name) {
    const found = this.tabs.find((t) => t.name === name)
    if (!found) return

    this.activeTab = found
    this.tabManager.render(found.name)
    // console.log(this.activeTab)

    this.renderTabcontent()
  }

  createBookElement(book) {
    const bookClone = this.bookItemTemplate.content.cloneNode(true)

    bookClone.querySelector('[data-testid="bookItemTitle"]').textContent =
      book.title
    bookClone.querySelector('[data-testid="bookItemAuthor"]').textContent =
      book.author
    bookClone.querySelector('[data-testid="bookItemYear"]').textContent =
      book.year

    const completeBtn = bookClone.querySelector(
      '[data-testid="bookItemIsCompleteButton"]',
    )
    completeBtn.innerHTML = book.isComplete
      ? html`
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-bookmark-check-icon lucide-bookmark-check"
          >
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" />
            <path d="m9 10 2 2 4-4" />
          </svg>
        `
      : html`
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-bookmark-icon lucide-bookmark"
          >
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
          </svg>
        `

    return bookClone
  }

  getContainerTemplate() {
    if (this.activeTab.name === 'all') return this.allBookListTemplate
    if (this.activeTab.name === 'complete') return this.completeBookListTemplate
    return this.incompleteBookListTemplate
  }

  renderTabcontent() {
    this.tabPanel.innerHTML = ''

    const selectedTemplate = this.getContainerTemplate()
    const containerClone = selectedTemplate.content.cloneNode(true)
    const listContainer = containerClone.querySelector('div')
    const filteredBooks = this.bookManager.getFilteredBooks(this.activeTab.name)

    filteredBooks.forEach((book, index) => {
      listContainer.appendChild(this.createBookElement(book))
      if (filteredBooks.length > 1 && index !== filteredBooks.length - 1) {
        const divider = document.createElement('hr')
        divider.className = 'border-t-2 border-dashed'
        listContainer.appendChild(divider)
      }
    })

    this.tabPanel.appendChild(containerClone)
  }
}

new App()
