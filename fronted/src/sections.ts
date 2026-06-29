export const SECTION_ICONS: Record<string, string> = {
  'Новичкам': '/pick/newi.svg',
  'Опытным': '/pick/exp.svg',
  'Старичкам': '/pick/old.svg',
  'Танкистам': '/pick/tanker.svg',
  'Стратегам': '/pick/strategy.svg',
  'Оффтоп': '/pick/offtop.svg',
}

export const SECTIONS = [
  { label: 'Новичкам', value: 'Новичкам', icon: '/pick/newi.svg' },
  { label: 'Опытным', value: 'Опытным', icon: '/pick/exp.svg' },
  { label: 'Старичкам', value: 'Старичкам', icon: '/pick/old.svg' },
  { label: 'Танкистам', value: 'Танкистам', icon: '/pick/tanker.svg' },
  { label: 'Стратегам', value: 'Стратегам', icon: '/pick/strategy.svg' },
  { label: 'Оффтоп', value: 'Оффтоп', icon: '/pick/offtop.svg' },
]

// Технический тег для кнопки выбора тега (не для создания треда)
export const TAG_SELECT_PLACEHOLDER = { label: 'Выбрать тег', value: '__select_tag__', icon: '/create/tag-find.svg' }