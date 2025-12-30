import Book from './Book.js'
import BookManager from './BookManager.js'
import { ICONS } from './constants.js'

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

    this.renderBooks()

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

    this.bookItemTemplate = document.getElementById('bookItemTemplate')
    this.emptyBookListTemplate = document.getElementById(
      'emptyBookListTemplate',
    )
    this.toastTemplate = document.getElementById('toastTemplate')

    this.searchForm = document.getElementById('searchBook')
    this.searchInput = document.getElementById('searchBookTitle')

    this.incompleteListContainer = document.getElementById('incompleteBookList')
    this.completeListContainer = document.getElementById('completeBookList')
  }

  initManagers() {
    this.bookManager = new BookManager()
    this.mainContainer = document.querySelector('main')
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
      this.renderBooks()
    })

    this.searchInput.addEventListener('input', (event) => {
      this.searchQuery = event.target.value
      this.renderBooks()
    })

    this.mainContainer.addEventListener('click', (event) => {
      const toggleBtn = event.target.closest(
        '[data-testid="bookItemIsCompleteButton"]',
      )
      if (toggleBtn) {
        const bookId = toggleBtn.dataset.bookId
        this.bookManager.toggleBookStatus(bookId)
        this.renderBooks()
        this.showToast('Status buku berhasil diperbarui! 🔄')
        return
      }

      const editBtn = event.target.closest('[data-testid="bookItemEditButton"]')
      if (editBtn) {
        const bookId = editBtn.dataset.bookId
        this.fillFormWithBookData(bookId)
        this.bookFormModal.showModal()
        return
      }

      const deleteBtn = event.target.closest(
        '[data-testid="bookItemDeleteButton"]',
      )
      if (deleteBtn) {
        const bookId = deleteBtn.dataset.bookId
        const book = this.bookManager.getBook(bookId)

        if (
          window.confirm(
            `Apakah Anda yakin ingin menghapus buku "${book.title}" secara permanen?`,
          )
        ) {
          this.bookManager.deleteBook(bookId)
          this.renderBooks()
          this.showToast('Buku berhasil dihapus! 🗑️')
        }
        return
      }
    })
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
    this.bookFormModal.querySelector('strong').textContent = `Edit Buku`
    this.bookFormSubmitButton.innerHTML = 'Simpan Perubahan'
    this.checkFormChanges()
  }

  checkFormChanges() {
    if (!this.editingId) {
      this.bookFormSubmitButton.disabled = false
      this.bookFormSubmitButton.classList.add(
        'hover:translate-1',
        'hover:shadow-none',
      )
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
      this.bookFormSubmitButton.classList.remove(
        'hover:translate-1',
        'hover:shadow-none',
      )
      this.bookFormSubmitButton.classList.add(
        'opacity-50',
        'cursor-not-allowed',
      )
    } else {
      this.bookFormSubmitButton.classList.add(
        'hover:translate-1',
        'hover:shadow-none',
      )
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

    this.renderBooks()
    this.bookFormModal.close()
    this.resetFormState()
  }

  createBookElement(book) {
    const bookClone = this.bookItemTemplate.content.cloneNode(true)

    const bookItemContainer = bookClone.querySelector(
      '[data-testid="bookItem"]',
    )
    bookItemContainer.setAttribute('data-bookid', book.id)
    bookItemContainer.dataset.bookid = book.id

    bookClone.querySelector('[data-testid="bookItemTitle"]').textContent =
      book.title
    bookClone.querySelector('[data-testid="bookItemAuthor"]').textContent =
      `Penulis: ${book.author}`
    bookClone.querySelector('[data-testid="bookItemYear"]').textContent =
      `Tahun: ${book.year}`

    const completeBtn = bookClone.querySelector(
      '[data-testid="bookItemIsCompleteButton"]',
    )
    completeBtn.dataset.bookId = book.id

    completeBtn.innerHTML = book.isComplete ? ICONS.check : ICONS.bookmark

    completeBtn.setAttribute(
      'aria-label',
      book.isComplete ? 'Tandai belum selesai' : 'Tandai selesai',
    )

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

  renderBooks() {
    this.incompleteListContainer.innerHTML = ''
    this.completeListContainer.innerHTML = ''

    const incompleteBooks = this.bookManager.getFilteredBooks(
      'incomplete',
      this.searchQuery,
    )
    const completeBooks = this.bookManager.getFilteredBooks(
      'complete',
      this.searchQuery,
    )

    if (incompleteBooks.length === 0) {
      const emptyState = this.emptyBookListTemplate.content.cloneNode(true)
      this.incompleteListContainer.appendChild(emptyState)
    } else {
      incompleteBooks.forEach((book) => {
        this.incompleteListContainer.appendChild(this.createBookElement(book))
      })
    }

    if (completeBooks.length === 0) {
      const emptyState = this.emptyBookListTemplate.content.cloneNode(true)
      this.completeListContainer.appendChild(emptyState)
    } else {
      completeBooks.forEach((book) => {
        this.completeListContainer.appendChild(this.createBookElement(book))
      })
    }
  }
}

new App()
