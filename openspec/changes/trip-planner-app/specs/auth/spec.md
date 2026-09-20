# Spec Delta

## Purpose

Lets a traveler sign in with their Google account so their trips can be saved to a personal account and shared with others.

## ADDED Requirements

### Requirement: Google sign-in
The system SHALL let a user sign in using their Google account as the only supported login method, via Supabase Auth's Google OAuth provider.

#### Scenario: Successful sign-in
- **WHEN** a user selects "Sign in with Google" and completes the Google OAuth consent flow
- **THEN** the system creates or reuses the user's account and starts an authenticated session

#### Scenario: Cancelled sign-in
- **WHEN** a user closes or cancels the Google OAuth consent screen before completing it
- **THEN** the system returns the user to the sign-in page with no session created and no error state left behind

### Requirement: Session persistence
The system SHALL keep a signed-in user authenticated across page reloads and new tabs until they sign out or the session expires.

#### Scenario: Reload keeps session
- **WHEN** a signed-in user reloads the page or reopens the app in a new tab
- **THEN** the system restores their session without requiring them to sign in again

#### Scenario: Sign out
- **WHEN** a signed-in user selects "Sign out"
- **THEN** the system ends their session and returns them to the sign-in page

### Requirement: Access gating
The system SHALL require an authenticated session before a user can save, view saved, or share a trip, while allowing anonymous use of trip-building tools (search, recommendations, calendar, budget) without sign-in.

#### Scenario: Anonymous user builds a trip
- **WHEN** an unauthenticated visitor searches destinations and arranges an itinerary
- **THEN** the system lets them do so without prompting for sign-in

#### Scenario: Anonymous user tries to save
- **WHEN** an unauthenticated visitor selects "Save trip"
- **THEN** the system prompts them to sign in with Google before the trip is saved
