import TabManager from './TabManager.js'
import Book from './Book.js'
import BookManager from './BookManager.js'
import { ICONS, ACTIVE_TAB_KEY, TABS } from './constants.js'

class App {
  static instance = null

  constructor() {
    if (App.instance) return App.instance

    this.editingId = null
    this.originalFormData = null

    this.searchQuery = ''

    this.initElements()
    this.initManagers()
    this.bindEvents()

    this.tabManager.render(this.activeTab.name)
    this.renderTabcontent()

    App.instance = this
  }

  initElements() {
    this.bookFormModal = document.getElementById('bookFormModal')
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
    this.emptyBookListTemplate = document.getElementById(
      'emptyBookListTemplate',
    )
    this.toastTemplate = document.getElementById('toastTemplate')

    this.confirmToggleIsCompleteModal = document.getElementById(
      'confirmToggleIsCompleteModal',
    )
    this.confirmToggleIsCompleteButton = document.getElementById(
      'confirmToggleIsCompleteButton',
    )

    this.confirmDeleteModal = document.getElementById('confirmDeleteModal')
    this.confirmDeleteButton = document.getElementById('confirmDeleteButton')

    this.searchForm = document.getElementById('searchBook')
    this.searchInput = document.getElementById('searchBookTitle')
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
      this.resetFormState()
      this.bookFormModal.showModal()
    })

    this.bookFormIsComplete.addEventListener('change', (event) => {
      this.bookFormSubmitButtonText.innerText = event.target.checked
        ? 'Sudah dibaca'
        : 'Belum dibaca'
    })

    this.bookForm.addEventListener('input', () => this.checkFormChanges())
    this.bookForm.addEventListener('change', () => this.checkFormChanges())

    this.bookForm.addEventListener('submit', (event) =>
      this.handleBookFormSubmit(event),
    )

    this.searchForm.addEventListener('submit', (event) => {
      event.preventDefault()
      this.searchQuery = this.searchInput.value
      this.renderTabcontent()
    })

    this.searchInput.addEventListener('input', (event) => {
      this.searchQuery = event.target.value
      this.renderTabcontent()
    })

    this.tabPanel.addEventListener('click', (event) => {
      const confirmToggleIsCompleteModalTrigger = event.target.closest(
        '[data-testid="bookItemIsCompleteButton"]',
      )
      if (confirmToggleIsCompleteModalTrigger) {
        this.pendingBookId = confirmToggleIsCompleteModalTrigger.dataset.bookId
        const book = this.bookManager.getBook(this.pendingBookId)
        if (book) {
          this.confirmToggleIsCompleteModal.querySelector('span').textContent =
            book.isComplete ? 'Belum Dibaca' : 'Sudah Dibaca'
          this.confirmToggleIsCompleteModal.showModal()
        }
      }

      const editBookModalTrigger = event.target.closest(
        '[data-testid="bookItemEditButton"]',
      )
      if (editBookModalTrigger) {
        const bookId = editBookModalTrigger.dataset.bookId
        this.fillFormWithBookData(bookId)
        this.bookFormModal.showModal()
      }

      const deleteBookModalTrigger = event.target.closest(
        '[data-testid="bookItemDeleteButton"]',
      )
      if (deleteBookModalTrigger) {
        this.pendingBookId = deleteBookModalTrigger.dataset.bookId
        const book = this.bookManager.getBook(this.pendingBookId)
        if (book) {
          this.confirmDeleteModal.querySelector('span').textContent = book.title
          this.confirmDeleteModal.showModal()
        }
      }
    })

    this.confirmToggleIsCompleteButton.addEventListener('click', () => {
      if (this.pendingBookId) {
        this.bookManager.toggleBookStatus(this.pendingBookId)
        this.renderTabcontent()
        this.showToast('Status buku berhasil diperbarui!')
        this.pendingBookId = null
      }
      this.confirmToggleIsCompleteModal.close()
    })

    this.confirmDeleteButton.addEventListener('click', () => {
      if (this.pendingBookId) {
        this.bookManager.deleteBook(this.pendingBookId)
        this.renderTabcontent()
        this.showToast('Buku berhasil dihapus!')
        this.pendingBookId = null
      }
      this.confirmDeleteModal.close()
    })
  }

  getActiveTab() {
    const activeTab = localStorage.getItem(ACTIVE_TAB_KEY)
    return activeTab ? JSON.parse(activeTab) : TABS[0]
  }

  resetFormState() {
    this.editingId = null
    this.originalFormData = null
    this.bookForm.reset()
    this.bookFormSubmitButton.disabled = false
    this.bookFormSubmitButton.classList.remove(
      'opacity-50',
      'cursor-not-allowed',
    )
    this.bookFormSubmitButton.classList.add(
      'hover:translate-1',
      'hover:shadow-none',
    )
    this.bookFormModal.querySelector('strong').textContent = 'Tambah Buku Baru'
    this.bookFormSubmitButton.innerHTML =
      'Masukkan Buku ke rak <span>Belum dibaca</span>'
    this.bookFormSubmitButtonText =
      this.bookFormSubmitButton.querySelector('span')
  }

  fillFormWithBookData(id) {
    const book = this.bookManager.getBook(id)
    if (!book) return

    this.editingId = id

    this.originalFormData = {
      title: book.title,
      author: book.author,
      year: book.year,
      isComplete: book.isComplete,
    }

    document.getElementById('bookFormTitle').value = book.title
    document.getElementById('bookFormAuthor').value = book.author
    document.getElementById('bookFormYear').value = book.year
    this.bookFormIsComplete.checked = book.isComplete

    this.bookFormModal.querySelector('strong').textContent =
      `Edit Buku ${book.title}`
    this.bookFormSubmitButton.innerHTML = 'Simpan Perubahan'

    this.checkFormChanges()
  }

  checkFormChanges() {
    if (!this.editingId) {
      this.bookFormSubmitButton.disabled = false
      this.bookFormSubmitButton.classList.add('hover:translate-1')
      this.bookFormSubmitButton.classList.add('hover:shadow-none')
      this.bookFormSubmitButton.classList.remove(
        'opacity-50',
        'cursor-not-allowed',
      )
      return
    }

    const currentTitle = document.getElementById('bookFormTitle').value
    const currentAuthor = document.getElementById('bookFormAuthor').value
    const currentYear =
      parseInt(document.getElementById('bookFormYear').value) || 0
    const currentIsComplete = this.bookFormIsComplete.checked

    const isUnchanged =
      currentTitle === this.originalFormData.title &&
      currentAuthor === this.originalFormData.author &&
      currentYear === this.originalFormData.year &&
      currentIsComplete === this.originalFormData.isComplete

    this.bookFormSubmitButton.disabled = isUnchanged
    if (isUnchanged) {
      this.bookFormSubmitButton.classList.remove('hover:translate-1')
      this.bookFormSubmitButton.classList.remove('hover:shadow-none')
      this.bookFormSubmitButton.classList.add(
        'opacity-50',
        'cursor-not-allowed',
      )
    } else {
      this.bookFormSubmitButton.classList.add('hover:translate-1')
      this.bookFormSubmitButton.classList.add('hover:shadow-none')
      this.bookFormSubmitButton.classList.remove(
        'opacity-50',
        'cursor-not-allowed',
      )
    }
  }

  handleBookFormSubmit(event) {
    event.preventDefault()

    const title = document.getElementById('bookFormTitle').value
    const author = document.getElementById('bookFormAuthor').value
    const year = parseInt(document.getElementById('bookFormYear').value)
    const isComplete = this.bookFormIsComplete.checked

    if (this.editingId) {
      this.bookManager.editBook(this.editingId, {
        title,
        author,
        year,
        isComplete,
      })
      this.showToast('Buku berhasil diperbarui!')
    } else {
      const newBook = new Book(
        crypto.randomUUID(),
        title,
        author,
        year,
        isComplete,
      )
      this.bookManager.addBook(newBook)
      this.showToast('Buku berhasil ditambahkan!')
    }

    this.renderTabcontent()
    this.bookFormModal.close()
    this.resetFormState()
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

    const editBtn = bookClone.querySelector(
      '[data-testid="bookItemEditButton"]',
    )
    editBtn.dataset.bookId = book.id

    const deleteBtn = bookClone.querySelector(
      '[data-testid="bookItemDeleteButton"]',
    )
    deleteBtn.dataset.bookId = book.id

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
    const filteredBooks = this.bookManager.getFilteredBooks(
      this.activeTab.name,
      this.searchQuery,
    )

    if (filteredBooks.length === 0) {
      this.tabPanel.appendChild(
        this.emptyBookListTemplate.content.cloneNode(true),
      )
      return
    }

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

  showToast(text, duration = 3000) {
    const clone = this.toastTemplate.content.cloneNode(true)
    const toastElement = clone.firstElementChild

    toastElement.querySelector('strong').textContent = text
    document.body.appendChild(toastElement)

    requestAnimationFrame(() => {
      toastElement.classList.add('bottom-5')
    })

    setTimeout(() => {
      toastElement.classList.remove('bottom-5')
      setTimeout(() => {
        if (document.body.contains(toastElement)) {
          toastElement.remove()
        }
      }, 500)
    }, duration)
  }
}

new App()
