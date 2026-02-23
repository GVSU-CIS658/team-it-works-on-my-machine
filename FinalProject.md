# Final Project Report

**Course:** Web Architecture Design and Implementation

**Project Title:** Study Group Planner

**Team Name:** It Works on My Machine

**Team Members & Roles:**

>  **Chris Sloma**   – Auth, Security, and Backend Architecture Lead

>  **Lloyd Nguyen**  – Groups and Shared Collaboration Features Lead

>  **Lilly Jackson** – Sessions and Scheduling Features Lead

>  **Amine Gamdou**  – Tasks, Dashboard, and Data Flow Documentation Lead

**Repository URL:** *[Insert GitHub URL]*

**Deployment URL:** *[Insert Live URL]*

**Submission Date:** *[Insert Date]*

# 1. Executive Summary

## 1.1 Project Overview

The **Study Group Planner** is a full-stack web application that allows students to:

* Create and join study groups
* Share updates in a group feed
* Schedule study sessions
* Maintain a private personal task list
* View aggregated information in a dashboard

The system demonstrates modern web architecture principles including:

* Frontend–backend separation
* Authenticated multi-user support
* Cloud database integration
* Backend-mediated database operations
* Public deployment

## 1.2 Core Application Features

### Authentication & Authorization

* User registration, login, logout
* Protected routes
* Backend identity verification
* Permission checks (private vs shared)

### Groups

* Create group
* Join via join code
* Leave group
* View group members

### Group Feed

* Single shared stream per group
* Create posts
* Edit/delete own posts
* View all group posts

### Study Sessions

* Create session (title, date/time, location or link)
* View upcoming sessions
* Delete sessions with permission rules

### Personal Tasks

* Create / edit / delete tasks
* Mark complete
* Owner-only visibility

### Dashboard

* Display user's groups
* Display upcoming sessions
* Display task reminders

# 2. System Architecture

## 2.1 High-Level Architecture Overview

The Study Group Planner follows a three-tier architecture:

1. **Frontend Layer** – Vue 3 + TypeScript
2. **Backend Service Layer** – Node.js + Express
3. **Cloud Data Layer** – Firebase Cloud Firestore

## 2.2 Architecture Diagram
```
[ Browser ]
     ↓
[ Vue + TypeScript SPA ]
     ↓ Axios (REST API)
[ Node.js + Express Backend ]
     ↓
[ Firebase Firestore ]
```
## 2.3 Frontend Responsibilities

* Component-based UI rendering
* Client-side validation
* Pinia state management
* Vue Router navigation
* Axios API communication
* Secure token handling

## 2.4 Backend Responsibilities

* REST API service layer
* Firebase Authentication token verification
* Permission checks
* Business logic enforcement
* All write operations to database
* Ownership validation

## 2.5 Database Responsibilities

* Persistent cloud storage
* Structured collections
* Indexed queries
* Data separation (private vs shared)

# 3. Frontend Architecture

## 3.1 Technology Stack

* Vue 3
* TypeScript
* Pinia (state management)
* Vue Router
* Axios (API communication)

## 3.2 Component-Based Structure

Example high-level structure:

```
App
 ├── AuthViews
 ├── DashboardView
 ├── GroupsView
 ├── GroupFeedView
 ├── SessionsView
 ├── TasksView
 └── SharedComponents
```

## 3.3 State Management

Pinia is used to manage:

* Authentication state
* User profile
* Groups data
* Sessions data
* Tasks data

# 4. Backend Architecture

## 4.1 Technology Stack

* Node.js
* Express
* Firebase Admin SDK
* Firebase Authentication
* Middleware-based architecture

## 4.2 REST API Overview

### Authentication Endpoints

| Method | Endpoint           | Description       |
| ------ | ------------------ | ----------------- |
| POST   | /api/auth/login    | Authenticate user |
| POST   | /api/auth/register | Register user     |

### Groups

| Method | Endpoint         |
| ------ | ---------------- |
| POST   | /api/groups      |
| POST   | /api/groups/join |
| DELETE | /api/groups/:id  |
| GET    | /api/groups/:id  |

### Group Feed

| Method | Endpoint             |
| ------ | -------------------- |
| GET    | /api/groups/:id/feed |
| POST   | /api/groups/:id/feed |
| PUT    | /api/feed/:id        |
| DELETE | /api/feed/:id        |

### Sessions

| Method | Endpoint                 |
| ------ | ------------------------ |
| GET    | /api/groups/:id/sessions |
| POST   | /api/groups/:id/sessions |
| DELETE | /api/sessions/:id        |

### Tasks (Private)

| Method | Endpoint       |
| ------ | -------------- |
| GET    | /api/tasks     |
| POST   | /api/tasks     |
| PUT    | /api/tasks/:id |
| DELETE | /api/tasks/:id |

## 4.3 Business Logic Separation

The frontend does not directly access Firestore for write operations.

The backend handles:

* Token verification
* Group membership validation
* Ownership checks
* Permission enforcement
* Scheduling logic
* Data validation

# 5. Database Design

## 5.1 Database Technology

Firebase Cloud Firestore

## 5.2 Collections

### Users

```
{
  displayName,
  email,
  groupIds: []
}
```

### Groups

```
{
  name,
  description,
  joinCode,
  ownerId,
  memberIds: []
}
```

### GroupFeed

```
{
  groupId,
  title,
  body,
  createdBy,
  createdAt
}
```

### Sessions

```
{
  groupId,
  title,
  startsAt,
  locationOrLink,
  createdBy
}
```

### Tasks (Private)

```
{
  ownerId,
  title,
  dueAt,
  isComplete,
  createdAt
}
```

## 5.3 Data Separation

### Private Data

* Tasks
* Profile information

### Shared Data

* Groups
* Group feed posts
* Study sessions

Ownership is enforced in backend middleware before data is returned or modified.

## 5.4 CRUD Implementation

| Feature  | Create | Read | Update | Delete |
| -------- | ------ | ---- | ------ | ------ |
| Groups   | ✔      | ✔    | ✔      | ✔      |
| Feed     | ✔      | ✔    | ✔      | ✔      |
| Sessions | ✔      | ✔    | —      | ✔      |
| Tasks    | ✔      | ✔    | ✔      | ✔      |

# 6. Authentication & Authorization

## 6.1 Authentication Strategy

* Firebase Authentication
* Secure token issuance
* Backend verification middleware
* Protected frontend routes

## 6.2 Authorization Rules

* Users can only edit/delete their own feed posts
* Users can only manage their own tasks
* Only group members can view group feed and sessions
* Group owner may manage group settings

# 7. Non-Functional Requirements

## 7.1 Security

* Firebase Authentication
* Backend token verification
* Permission middleware
* HTTPS deployment
* Input validation

## 7.2 Scalability

* Stateless backend
* Firestore auto-scaling
* Indexed queries
* Efficient group/session lookups

## 7.3 Performance

* Optimized Firestore queries
* Filtered session queries by group
* Dashboard aggregation strategy

## 7.4 Reliability

* Centralized error handling
* Backend validation before writes
* Cloud-hosted infrastructure

# 8. Deployment

## 8.1 Hosting Plan

* Frontend: *[TBD – e.g., Firebase Hosting or Vercel]*
* Backend: *[TBD – e.g., Render, Railway, or Cloud Functions]*

## 8.2 Deployment Architecture

* Public frontend application
* Public REST API endpoint
* Environment variables for secure config
* CORS configuration

# 9. Development Process

## 9.1 Git Workflow

* Single shared GitHub repository
* Feature branches
* Pull requests required
* Steady commit history

# 10. Challenges & Engineering Decisions

*To be completed during implementation.*

# 11. Future Improvements

* Notifications for upcoming sessions
* Real-time updates via listeners
* Pagination for feed
* Role-based permissions expansion
* Testing and CI/CD pipeline

# 12. Conclusion

The Study Group Planner demonstrates:

* Clear frontend/backend separation
* Backend-mediated Firestore operations
* Multi-user authentication and authorization
* Private and shared data management
* Cloud-based deployment
* Component-based frontend architecture