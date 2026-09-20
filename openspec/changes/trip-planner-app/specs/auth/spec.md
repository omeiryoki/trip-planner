# Spec Delta

## Purpose

Lets a traveler sign in so their trips can be saved to a personal account and shared with others.

## ADDED Requirements

### Requirement: Email/password sign-in
The system SHALL let a user create an account and sign in using an email address and password, via Supabase Auth's built-in email provider.

#### Scenario: Successful sign-up
- **WHEN** a user submits a new email and password on "Create account"
- **THEN** the system creates the account and either starts an authenticated session or, if email confirmation is required, tells the user to confirm their email before signing in

#### Scenario: Successful sign-in
- **WHEN** a user submits a matching email and password on "Sign in"
- **THEN** the system starts an authenticated session

#### Scenario: Wrong credentials
- **WHEN** a user submits an email/password combination that does not match an account
- **THEN** the system shows an error and does not start a session

### Requirement: Google sign-in (deferred)
The system MAY additionally let a user sign in using their Google account, via Supabase Auth's Google OAuth provider, as an alternative to email/password. The `signInWithGoogle` action is implemented in the auth module but is not currently wired into the sign-in UI - re-enabling it is a matter of adding the button back, not further backend work.

#### Scenario: Successful sign-in (once re-enabled in the UI)
- **WHEN** a user selects "Sign in with Google" and completes the Google OAuth consent flow
- **THEN** the system creates or reuses the user's account and starts an authenticated session

#### Scenario: Cancelled sign-in (once re-enabled in the UI)
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
- **THEN** the system prompts them to sign in before the trip is saved
