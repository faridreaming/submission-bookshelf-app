class TabManager {
  constructor({ tabs, rootElement, onChange }) {
    this.tabs = tabs
    this.root = rootElement
    this.buttons = this.root.querySelectorAll('button')
    this.onChange = onChange

    this.bindEvents()
  }

  bindEvents() {
    this.buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const value = btn.value
        this.onChange(value)
      })
    })
  }

  render(activeTabName) {
    this.buttons.forEach((btn) => {
      btn.setAttribute('aria-selected', btn.value === activeTabName)
    })
  }
}

export default TabManager
