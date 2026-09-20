# Spec Delta

## Purpose

Lets a user take their planned itinerary out of the app and into Google Maps and Google Calendar, or open it there directly.

## ADDED Requirements

### Requirement: Export itinerary to Google Calendar
The system SHALL let a user export their trip's scheduled itinerary items as events in Google Calendar, preserving each item's date, duration, and location.

#### Scenario: Export a scheduled trip
- **WHEN** a signed-in user exports a trip that has itinerary items scheduled on the calendar
- **THEN** the system creates corresponding events in the user's Google Calendar with matching dates, durations, and locations

#### Scenario: Export with unscheduled items
- **WHEN** a user exports a trip that has itinerary items not yet assigned to a day
- **THEN** the system exports only the scheduled items and tells the user which items were skipped

### Requirement: Open itinerary in Google Maps
The system SHALL let a user open a trip's destinations and itinerary items in Google Maps to view them on a map.

#### Scenario: Open trip in Maps
- **WHEN** a user selects "Open in Google Maps" for a trip
- **THEN** the system opens Google Maps with the trip's itinerary locations plotted
