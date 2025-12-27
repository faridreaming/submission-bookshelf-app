class BookManager {
  constructor() {
    this.LOCAL_STORAGE_KEY = 'bookshelf_app_data'
    this.books = this.loadFromLocalStorage()
  }

  loadFromLocalStorage() {
    const storedData = localStorage.getItem(this.LOCAL_STORAGE_KEY)
    return storedData ? JSON.parse(storedData) : []
  }

  saveToLocalStorage() {
    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(this.books))
  }

  addBook(book) {
    this.books.push(book)
    this.saveToLocalStorage()
  }

  getBooks() {
    return this.books
  }

  getBook(id) {
    return this.books.filter((book) => book.id === id)[0]
  }

  getFilteredBooks(activeTabName) {
    return this.books.filter((book) => {
      if (activeTabName === 'all') return true
      if (activeTabName === 'complete') return book.isComplete
      if (activeTabName === 'incomplete') return !book.isComplete
      return false
    })
  }

  deleteBook(id) {
    this.books = this.books.filter((book) => book.id !== id)
    this.saveToLocalStorage()
  }

  toggleBookStatus(id) {
    const foundBook = this.books.find((book) => book.id === id)
    if (foundBook) {
      foundBook.isComplete = !foundBook.isComplete
      this.saveToStorage()
    }
  }
}

export default BookManager
