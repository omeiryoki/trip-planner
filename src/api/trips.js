// Persists a trip (and its destinations/items/legs) to Supabase.
// Save creates a row on first call, then updates the same row on every later call.

export async function saveTrip(supabase, trip, ownerId) {
  const tripRow = {
    id: trip.id ?? undefined,
    owner_id: ownerId,
    name: trip.name,
    start_date: trip.startDate,
    end_date: trip.endDate,
    display_currency: trip.displayCurrency,
    traveler_count: trip.travelerCount,
    updated_at: new Date().toISOString(),
  }

  const { data: savedTrip, error: tripError } = await supabase
    .from('trips')
    .upsert(tripRow)
    .select()
    .single()
  if (tripError) throw tripError

  const tripId = savedTrip.id

  await replaceChildRows(supabase, 'destinations', tripId, trip.destinations, (d) => ({
    id: d.id,
    trip_id: tripId,
    name: d.name,
    granularity: d.granularity,
    lat: d.lat ?? null,
    lng: d.lng ?? null,
    place_id: d.placeId ?? null,
  }))

  await replaceChildRows(supabase, 'itinerary_items', tripId, trip.items, (it) => ({
    id: it.id,
    trip_id: tripId,
    destination_id: it.destinationId ?? null,
    place_id: it.placeId ?? null,
    name: it.name,
    category: it.category,
    day_date: it.dayDate ?? null,
    duration_minutes: it.durationMinutes ?? null,
    cost: it.cost ?? null,
    cost_currency: it.costCurrency ?? null,
    sort_order: it.sortOrder ?? 0,
  }))

  await replaceChildRows(supabase, 'travel_legs', tripId, trip.legs, (leg) => ({
    id: leg.id,
    trip_id: tripId,
    from_item_id: leg.fromItemId,
    to_item_id: leg.toItemId,
    selected_mode: leg.selectedMode ?? null,
    cost: leg.cost ?? null,
    cost_currency: leg.costCurrency ?? null,
  }))

  return { ...trip, id: tripId }
}

async function replaceChildRows(supabase, table, tripId, rows, toRow) {
  const { error: deleteError } = await supabase.from(table).delete().eq('trip_id', tripId)
  if (deleteError) throw deleteError
  if (rows.length === 0) return
  const { error: insertError } = await supabase.from(table).insert(rows.map(toRow))
  if (insertError) throw insertError
}

export async function listMyTrips(supabase) {
  const { data, error } = await supabase
    .from('trips')
    .select('id, name, start_date, end_date, display_currency, updated_at')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data
}

export async function shareTripByEmail(supabase, tripId, email, role) {
  const { data: userId, error: lookupError } = await supabase.rpc('find_user_id_by_email', {
    email,
  })
  if (lookupError) throw lookupError
  if (!userId) {
    throw new Error(`No account found for ${email}. They need to sign in at least once first.`)
  }

  const { error } = await supabase
    .from('trip_collaborators')
    .upsert({ trip_id: tripId, user_id: userId, role })
  if (error) throw error
}
