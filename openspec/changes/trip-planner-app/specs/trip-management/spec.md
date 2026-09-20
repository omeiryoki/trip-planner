# Spec Delta

## Purpose

Lets a signed-in user create a trip, specify where it goes, save it to their account, and share it with other trip participants.

## ADDED Requirements

### Requirement: Destination specification
The system SHALL let a user specify one or more destinations for a trip at the level of place, city, province/state, or country.

#### Scenario: Add a city destination (Google Maps configured)
- **WHEN** a user searches for and selects a city as a trip destination
- **THEN** the system adds it to the trip's destination list

#### Scenario: Add a destination without Google Maps configured
- **WHEN** no Google Maps API key is configured and a user types a destination name and picks its granularity (place/city/province/country) manually
- **THEN** the system adds it to the trip's destination list without coordinates or a Google place ID

#### Scenario: Mixed destination granularity
- **WHEN** a user adds one destination as a country and another as a specific place
- **THEN** the system accepts both and keeps them distinguishable by their granularity in the trip

### Requirement: Save trip to account
The system SHALL let an authenticated user save a trip (destinations, itinerary, and settings) to their account.

#### Scenario: First save
- **WHEN** a signed-in user selects "Save trip" on a new, unsaved trip
- **THEN** the system persists the trip under their account and confirms it was saved

#### Scenario: Update existing trip
- **WHEN** a signed-in user modifies a previously saved trip and saves again
- **THEN** the system updates the same saved trip rather than creating a duplicate

### Requirement: List saved trips
The system SHALL let a signed-in user see and reopen the trips saved to their account.

#### Scenario: View saved trips
- **WHEN** a signed-in user opens "My trips"
- **THEN** the system lists every trip they own or that has been shared with them

### Requirement: Share trip with collaborators
The system SHALL let a trip owner share a saved trip with other users so they can view or edit it.

#### Scenario: Owner shares a trip
- **WHEN** a trip owner enters another user's email and grants edit access
- **THEN** the system grants that user access to view and edit the trip the next time they sign in

#### Scenario: Non-owner without access
- **WHEN** a user who is not the owner and has no granted access opens a trip's link
- **THEN** the system denies access to the trip's contents

#### Scenario: Collaborator edits
- **WHEN** a user with edit access changes the itinerary of a shared trip
- **THEN** the system saves the change so the owner and other collaborators see it
