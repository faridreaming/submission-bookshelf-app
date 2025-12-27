const html = (strings, ...values) => String.raw({ raw: strings }, ...values)

export const ACTIVE_TAB_KEY = 'bookshelf_active_tab'

export const TABS = [
  { name: 'all', title: 'Daftar Semua Buku' },
  { name: 'incomplete', title: 'Daftar Buku Belum Dibaca' },
  { name: 'complete', title: 'Daftar Buku Sudah Dibaca' },
]

export const ICONS = {
  check: html`
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
  `,
  bookmark: html`
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
  `,
}
