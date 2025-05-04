# Frontend Development Prompt for Hospital Management System

## Overview

Create a modern, intuitive, and responsive frontend for the MediSync Hospital Management System that interfaces with the API documented in `readme.md`. The application should be a single-page application with proper routing, authentication flows, and responsive design that works well on both desktop and mobile devices.

## IMPORTANT: Keep It Simple!

Focus on simplicity and clarity in all aspects of the implementation:

- Write clean, straightforward code with minimal abstractions
- Avoid complex state management patterns when simple ones will suffice
- Don't overengineer components - prefer simple functional components
- Focus on making core user flows work perfectly before adding extra features
- Minimize third-party libraries and dependencies
- Use the simplest solution that satisfies the requirements
- Favor readability and maintainability over clever code

## Technical Requirements

- Use React.js for the frontend framework
- Implement TypeScript for type safety
- Use a component library like Material-UI or Ant Design for UI components
- Implement React Router for navigation
- Use Context API or Redux for state management
- Include proper error handling and loading states
- Implement JWT authentication with secure token storage

## User Roles and Features

The system has four user roles, each with specific views and functionalities:

### 1. Patient Role

- **Login/Registration View**
  - Allow patients to register with personal details
  - Login form with email/password
- **Dashboard**
  - Display upcoming appointments
  - Show account balance
  - Quick links to book appointments, view profile, etc.
- **Profile Management**
  - View and edit personal information
  - Update contact details
- **Balance Management**
  - Add funds to account
  - View transaction history
- **Appointment Booking**
  - Search for doctors by specialization
  - View doctor profiles and ratings
  - Select available dates and time slots
  - Confirm and book appointments
- **Appointments History**
  - List of past and upcoming appointments
  - Cancel upcoming appointments
  - Rate and review completed appointments

### 2. Doctor Role

- **Dashboard**
  - Display today's appointments
  - Show key statistics (patients seen, avg rating)
- **Profile View**
  - View professional information
  - See performance metrics
- **Appointments Management**
  - View scheduled appointments
  - Update appointment status (Completed/Cancelled)
  - Filter appointments by date/status
- **Patient Management**
  - View list of patients
  - Access patient appointment history
- **Resources Requests**
  - Request medical resources
  - View status of requested resources

### 3. Admin Role

- **Dashboard**
  - Overview of system statistics
  - Quick links to management sections
- **Doctor Management**
  - View all doctors
  - Filter and search functionality
- **Patient Management**
  - View all patients
  - Filter and search functionality
- **Reports and Analytics**
  - Appointment statistics
  - Revenue statistics
  - Generate comprehensive reports
  - Data visualization with charts and graphs
- **Resources Management**
  - Add new medical resources
  - Update resource availability

### 4. Staff Role

- **Resources Management**
  - View and manage medical resources
  - Update resource availability status

## Key Functionality Requirements

### 1. Doctor Appointment Booking Process

Implement a clear, step-by-step booking process:

1. **Doctor Selection Page**

   - Display a list of available doctors with:
     - Doctor's name and photo
     - Specialization
     - Average rating (with star visualization)
     - Brief bio
   - Include filters for:
     - Specialization dropdown
     - Minimum rating filter
     - Search by doctor name

2. **Doctor Profile View**

   - When a doctor is selected, show detailed profile:
     - Professional qualifications
     - Experience
     - Detailed ratings and review count
     - Appointment fee

3. **Date Selection**

   - Calendar view showing available dates
   - Unavailable dates should be disabled
   - Selected date should highlight available time slots

4. **Time Slot Selection**

   - Display all available time slots for the selected date
   - Time slots should be grouped by morning/afternoon/evening
   - Already booked slots should be disabled

5. **Appointment Confirmation**
   - Show summary with doctor info, date, time
   - Display appointment fee
   - Show current patient balance
   - Include confirmation button
6. **Payment Processing**
   - Verify if patient balance is sufficient
   - If balance is insufficient, display warning with option to add funds
   - If balance is sufficient, confirm payment and booking
7. **Booking Confirmation**
   - Display success message with appointment details
   - Option to add to calendar
   - Show in upcoming appointments list

### 2. Appointment Review System

Create an intuitive review system for completed appointments:

1. **Past Appointments View**
   - List view of past appointments with:
     - Doctor name and photo
     - Date and time of appointment
     - Status (Completed/Cancelled)
     - Option to review (if eligible)
2. **Review Eligibility Check**
   - System should verify if appointment is eligible for review
   - Only show review option if within valid period (e.g., within 7 days after appointment)
3. **Review Form**
   - Star rating component (1-5 stars)
   - Text area for comments/feedback
   - Submit button
4. **Review Confirmation**
   - Thank you message after submission
   - Updated doctor rating in the system
   - Review should appear in doctor profile

### 3. Medical Resources Management

Implement comprehensive resource management:

1. **Resource Listing Page**
   - Display all medical resources with:
     - Resource name
     - Type/category
     - Current availability status
     - Department association
   - Include filters for:
     - Resource type
     - Department
     - Availability status
     - Search by name
2. **Resource Reservation (For Doctors)**
   - Select resource from list
   - Choose date and time for reservation
   - System checks availability for requested time
   - Confirmation of reservation
   - View status of requested resources
3. **Resource Management (For Admin/Staff)**
   - Add new resources to the system
   - Update resource availability status
   - View usage statistics and trends
   - Generate reports on resource utilization
4. **Resource Analytics (For Admin)**
   - Dashboard showing resource usage over time
   - Identify peak usage periods
   - Track availability trends
   - Generate reports on resource allocation efficiency

## UI/UX Requirements

- Clean, professional medical-themed design
- Responsive layout for all screen sizes
- Intuitive navigation with breadcrumbs
- Accessible design adhering to WCAG guidelines
- Clear feedback for user actions
- Loading states for asynchronous operations
- Helpful error messages for failed operations
- Interactive calendars for appointment scheduling
- Card-based designs for displaying data collections
- Dashboard with data visualizations where appropriate

## Additional Considerations

- Implement proper form validation
- Use skeleton loaders for improving perceived performance
- Add dark/light theme toggle
- Implement search and filter functionality where relevant
- Use modals for quick actions without navigating away
- Include confirmation dialogs for irreversible actions
- Add notifications for important events
- Include tooltips for complex UI elements
- Use pagination for large data sets

## Example User Flows to Implement

1. **Patient Appointment Booking Flow**

   - Login
   - Navigate to book appointment
   - Search/filter for doctors by specialization
   - Select a doctor
   - View available dates
   - Select a date and time slot
   - Confirm booking
   - View booking in upcoming appointments

2. **Doctor Appointment Management Flow**

   - Login
   - View today's appointments
   - Select an appointment
   - Update appointment status
   - Add notes/prescriptions

3. **Admin Analytics Flow**

   - Login
   - Navigate to analytics dashboard
   - Select time period for statistics
   - View visualized data
   - Generate report

4. **Resource Allocation Flow**
   - Doctor logs in
   - Navigates to resources page
   - Filters for required resource type
   - Selects specific resource
   - Requests reservation for specific date/time
   - Receives confirmation of allocation

## API Integration

Connect all frontend functionality to the corresponding API endpoints as documented in the `readme.md` file. Ensure proper handling of:

- Authentication tokens
- Request/response formats
- Error states
- Loading states
- Data caching where appropriate

## Development Philosophy

Remember that the goal is to create a functional, user-friendly application, not to showcase complex programming techniques:

- Prioritize working features over architectural perfection
- Implement direct, straightforward API calls
- Keep component hierarchies shallow
- Use simple state management techniques
- Don't prematurely optimize for scale or edge cases
- Follow the YAGNI principle (You Aren't Gonna Need It)

## Deliverables

- A responsive, well-designed frontend application
- Clean, modular, and well-commented code
- Comprehensive error handling
- Detailed instructions for running the application
- List of any additional dependencies used

## Design Inspiration

The design should convey trust, professionalism, and simplicity. Consider using:

- Clean, minimal UI with ample white space
- A color scheme based around calming blues and greens
- Clear typography with good hierarchy
- Subtle animations for transitions
- Iconography that clearly communicates action intent

Aim to create an interface that is accessible to users of all technical abilities, from young patients to elderly users, with a focus on clarity and ease of use.
