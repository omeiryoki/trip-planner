# Spec Delta

## Purpose

Suggests nearby attractions, restaurants, and hotels around a destination the user has added to their trip, so they can discover and add places without leaving the app.

## ADDED Requirements

### Requirement: Nearby recommendations by category
The system SHALL suggest attractions, restaurants, and hotels located near a selected trip destination, grouped by category.

#### Scenario: Recommendations for a city destination
- **WHEN** a user selects a city already added to their trip
- **THEN** the system shows lists of nearby attractions, restaurants, and hotels for that city

#### Scenario: No results nearby
- **WHEN** no attractions, restaurants, or hotels are found near a selected destination
- **THEN** the system shows an empty state for that category instead of an error

### Requirement: Add recommendation to trip
The system SHALL let a user add a recommended place directly to their trip's itinerary from the recommendation list.

#### Scenario: Add a recommended restaurant
- **WHEN** a user selects "Add to trip" on a recommended restaurant
- **THEN** the system adds that restaurant as an itinerary item under the corresponding destination

### Requirement: Recommendation details
The system SHALL show, for each recommended place, at least its name, category, and location, when available from the underlying place data.

#### Scenario: View place details
- **WHEN** a user opens a recommended place's details
- **THEN** the system shows its name, category, and location
