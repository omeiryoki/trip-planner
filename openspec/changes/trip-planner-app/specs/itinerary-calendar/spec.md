# Spec Delta

## Purpose

Lets a user arrange the places they have chosen into a day-by-day calendar and control how long they stay at each one.

## ADDED Requirements

### Requirement: Arrange places on a calendar
The system SHALL let a user place chosen itinerary items onto specific days of a trip calendar, in any order.

#### Scenario: Assign a place to a day
- **WHEN** a user drags a chosen place onto a specific day in the calendar
- **THEN** the system schedules that place on that day

#### Scenario: Reorder within a day
- **WHEN** a user reorders two places already scheduled on the same day
- **THEN** the system reflects the new order for that day

### Requirement: Adjustable stay duration
The system SHALL let a user set how long they will stay at each scheduled place, and reflect that duration in the calendar view.

#### Scenario: Set duration for a place
- **WHEN** a user sets the stay duration for a scheduled place to a specific number of hours or days
- **THEN** the system updates the calendar to reflect that duration and adjusts the time available for subsequent places that day

#### Scenario: Duration spanning multiple days
- **WHEN** a user sets a stay duration for a place that exceeds one day (e.g. a hotel stay)
- **THEN** the system shows that place as occupying each of the spanned days

### Requirement: Trip date range
The system SHALL let a user define the overall start and end dates of the trip, bounding the calendar.

#### Scenario: Set trip dates
- **WHEN** a user sets a trip's start and end dates
- **THEN** the system shows a calendar limited to that date range

#### Scenario: Scheduling outside trip dates
- **WHEN** a user attempts to schedule a place on a day outside the trip's date range
- **THEN** the system prevents the assignment and indicates the day is outside the trip dates
