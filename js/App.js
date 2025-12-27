import TabManager from './TabManager.js'
import Book from './Book.js'
import BookManager from './BookManager.js'
import { ICONS, ACTIVE_TAB_KEY, TABS } from './constants.js'

class App {
  static instance = null

  constructor() {
    if (App.instance) return App.instance

    this.initElements()
    this.initManagers()
    this.bindEvents()

    this.tabManager.render(this.activeTab.name)
    this.renderTabcontent()

    App.instance = this
  }

  initElements() {
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

    this.confirmToggleIsCompleteModal = document.getElementById(
      'confirmToggleIsCompleteModal',
    )
    this.confirmToggleIsCompleteButton = document.getElementById(
      'confirmToggleIsCompleteButton',
    )
  }

  initManagers() {
    this.activeTab = this.getActiveTab()
    this.bookManager = new BookManager()

    this.tabManager = new TabManager({
      tabs: TABS,
      rootElement: document.getElementById('tablist'),
      onChange: (tabName) => this.setTab(tabName),
    })

    this.tabPanel = document.querySelector('[role="tabpanel"]')
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

    this.tabPanel.addEventListener('click', (event) => {
      const trigger = event.target.closest(
        '[data-testid="bookItemIsCompleteButton"]',
      )
      if (!trigger) return
      this.pendingBookId = trigger.dataset.bookId
      const selectedBook = this.bookManager.getBook(this.pendingBookId)
      this.confirmToggleIsCompleteModal.querySelector('p span').textContent =
        selectedBook.isComplete ? 'Belum Dibaca' : 'Sudah Dibaca'
      this.confirmToggleIsCompleteModal.showModal()
    })

    this.confirmToggleIsCompleteButton.addEventListener('click', () => {
      if (this.pendingBookId) {
        this.bookManager.toggleBookStatus(this.pendingBookId)
        this.renderTabcontent()
        this.pendingBookId = null
      }
      this.confirmToggleIsCompleteModal.close()
    })
  }

  getActiveTab() {
    const activeTab = localStorage.getItem(ACTIVE_TAB_KEY)
    return activeTab ? JSON.parse(activeTab) : TABS[0]
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
    const found = TABS.find((t) => t.name === name)
    if (!found) return

    this.activeTab = found
    localStorage.setItem(ACTIVE_TAB_KEY, JSON.stringify(this.activeTab))
    this.tabManager.render(found.name)

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
    completeBtn.dataset.bookId = book.id
    completeBtn.innerHTML = book.isComplete ? ICONS.check : ICONS.bookmark

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
