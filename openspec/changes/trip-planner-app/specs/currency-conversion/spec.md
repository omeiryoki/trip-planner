# Spec Delta

## Purpose

Lets a user choose the currency they want trip costs displayed in, converting underlying costs using a current exchange rate.

## ADDED Requirements

### Requirement: Currency selection
The system SHALL let a user choose a display currency for a trip from a list of supported currencies.

#### Scenario: Change display currency
- **WHEN** a user selects a different display currency for their trip
- **THEN** the system shows all cost figures for that trip converted into the newly selected currency

### Requirement: Conversion using current exchange rate
The system SHALL convert cost figures into the selected display currency using a current exchange rate.

#### Scenario: Converted amount shown
- **WHEN** an itinerary item's cost is recorded in one currency and the trip's display currency is different
- **THEN** the system shows the item's cost converted to the display currency using the current exchange rate

### Requirement: Stale or unavailable exchange rate
The system SHALL indicate to the user when a current exchange rate cannot be retrieved, rather than silently showing an incorrect conversion.

#### Scenario: Exchange rate service unavailable
- **WHEN** the exchange rate service cannot be reached while converting a cost
- **THEN** the system tells the user the conversion could not be updated and shows the last known rate or the original currency instead of a silently wrong value
