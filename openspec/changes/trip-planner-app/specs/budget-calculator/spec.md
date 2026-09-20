# Spec Delta

## Purpose

Calculates how much a trip costs per day and in total, per person, from the itinerary items and travel legs the user has planned.

## ADDED Requirements

### Requirement: Per-day cost calculation
The system SHALL calculate a total estimated cost for each day of the trip, summing the costs of that day's itinerary items and travel legs.

#### Scenario: Day with multiple costed items
- **WHEN** a day has two itinerary items with costs and one travel leg with an estimated cost
- **THEN** the system shows that day's total as the sum of those three costs

#### Scenario: Day with no costed items
- **WHEN** a day has no itinerary items or travel legs with a cost
- **THEN** the system shows that day's total as zero rather than omitting it

### Requirement: Whole-trip total per person
The system SHALL calculate the total estimated cost of the trip and express it as a per-person amount, given the number of people on the trip.

#### Scenario: Total for a group trip
- **WHEN** a trip has a total estimated cost and the user has set the number of travelers to 4
- **THEN** the system shows the per-person total as the trip total divided by 4

#### Scenario: Traveler count not set
- **WHEN** a user has not specified the number of travelers
- **THEN** the system defaults to 1 traveler for the per-person calculation

### Requirement: Cost recalculation on itinerary change
The system SHALL recalculate day and trip totals whenever itinerary items, travel legs, or traveler count change.

#### Scenario: Adding an item updates totals
- **WHEN** a user adds a new itinerary item with a cost to a day
- **THEN** the system updates that day's total and the trip's overall total immediately
