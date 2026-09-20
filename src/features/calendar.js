import { getTrip, itemsForDay, unscheduledItems, updateItem } from '../state/tripStore.js'

function eachDate(startDate, endDate) {
  const days = []
  const cursor = new Date(startDate)
  const end = new Date(endDate)
  while (cursor <= end) {
    days.push(cursor.toISOString().slice(0, 10))
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

export function renderCalendar(container) {
  const trip = getTrip()
  container.innerHTML = ''

  if (!trip.startDate || !trip.endDate) {
    container.innerHTML = '<p class="muted">Set trip start and end dates to see the calendar.</p>'
    return
  }

  const days = eachDate(trip.startDate, trip.endDate)
  const calendar = document.createElement('div')
  calendar.className = 'calendar'

  for (const day of days) {
    calendar.appendChild(renderDay(day))
  }
  container.appendChild(calendar)

  const unscheduled = renderUnscheduledTray()
  container.appendChild(unscheduled)
}

function itemsSpanningDay(dayDate) {
  const trip = getTrip()
  return trip.items.filter((it) => {
    if (!it.dayDate) return false
    const nights = it.nights ?? 1
    const start = new Date(it.dayDate)
    const end = new Date(start)
    end.setDate(end.getDate() + nights - 1)
    const d = new Date(dayDate)
    return d >= start && d <= end
  })
}

function renderDay(dayDate) {
  const dayEl = document.createElement('div')
  dayEl.className = 'calendar__day'
  dayEl.dataset.day = dayDate

  const heading = document.createElement('strong')
  heading.textContent = dayDate
  dayEl.appendChild(heading)

  const list = document.createElement('div')
  list.className = 'calendar__items'
  for (const item of itemsSpanningDay(dayDate)) {
    const isStart = item.dayDate === dayDate
    list.appendChild(renderItemChip(item, !isStart))
  }
  dayEl.appendChild(list)

  dayEl.addEventListener('dragover', (e) => {
    e.preventDefault()
    dayEl.classList.add('drag-over')
  })
  dayEl.addEventListener('dragleave', () => dayEl.classList.remove('drag-over'))
  dayEl.addEventListener('drop', (e) => {
    e.preventDefault()
    dayEl.classList.remove('drag-over')
    const itemId = e.dataTransfer.getData('text/item-id')
    if (!itemId) return
    const dayItems = itemsForDay(dayDate)
    updateItem(itemId, { dayDate, sortOrder: dayItems.length })
  })

  return dayEl
}

function renderUnscheduledTray() {
  const tray = document.createElement('div')
  tray.className = 'card'
  tray.innerHTML = '<strong>Unscheduled places</strong>'
  const list = document.createElement('div')
  list.className = 'calendar__items'
  for (const item of unscheduledItems()) {
    list.appendChild(renderItemChip(item))
  }
  tray.appendChild(list)
  return tray
}

function renderItemChip(item, isContinuation = false) {
  const chip = document.createElement('div')
  chip.className = 'card'
  chip.dataset.itemId = item.id

  if (isContinuation) {
    chip.innerHTML = `<span>${item.name} <span class="muted">(cont.)</span></span>`
    return chip
  }

  chip.draggable = true
  chip.innerHTML = `
    <span>${item.name}</span>
    <label class="muted">
      Duration (min):
      <input class="js-duration" type="number" min="0" step="15" value="${item.durationMinutes ?? ''}" />
    </label>
    <label class="muted">
      Nights (multi-day stay):
      <input class="js-nights" type="number" min="1" step="1" value="${item.nights ?? 1}" />
    </label>
  `
  chip.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/item-id', item.id)
  })
  chip.querySelector('.js-duration').addEventListener('change', (e) => {
    updateItem(item.id, { durationMinutes: Number(e.target.value) || null })
  })
  chip.querySelector('.js-nights').addEventListener('change', (e) => {
    updateItem(item.id, { nights: Math.max(1, Number(e.target.value) || 1) })
  })
  return chip
}
