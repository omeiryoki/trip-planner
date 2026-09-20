# Spec Delta

## Purpose

Suggests how to travel between two itinerary stops by public transport or private vehicle, with an estimated cost for each option.

## ADDED Requirements

### Requirement: Travel mode suggestions between stops
The system SHALL suggest at least one public-transport route and one private-vehicle route between two consecutive itinerary stops, when a route exists.

#### Scenario: Route between two stops in the same city
- **WHEN** a user views the travel leg between two consecutive itinerary stops
- **THEN** the system shows a public-transport option and a private-vehicle option for getting between them

#### Scenario: No route available
- **WHEN** no route can be found between two consecutive stops (e.g. no connecting transport data)
- **THEN** the system tells the user no route is available for that leg instead of showing incorrect data

### Requirement: Estimated travel cost
The system SHALL show an estimated cost for each suggested travel option.

#### Scenario: Cost shown per option
- **WHEN** a user views the public-transport and private-vehicle options for a leg
- **THEN** the system shows an estimated cost alongside each option

### Requirement: Selected travel mode feeds budget
The system SHALL let a user pick one travel option per leg, and that choice SHALL be used as the leg's cost in the trip's budget calculations.

#### Scenario: User picks private vehicle
- **WHEN** a user selects the private-vehicle option for a leg
- **THEN** the system uses that option's estimated cost for the leg in the trip's total budget
