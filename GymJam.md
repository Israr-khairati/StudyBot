# GymOS Screen Flow & Navigation Architecture

This document maps out the user journey and screen connections for both the **Web Admin Panel** and the **Member Mobile App**. 

*(GitHub natively renders these Mermaid diagrams. Just view this file on GitHub to see the visual flowcharts!)*

## 1. Web App (Admin Panel & Kiosk)
**Audience:** Gym Owners, Receptionists, Coaches

```mermaid
flowchart TD
    %% Define Styles
    classDef auth fill:#f3f4f6,stroke:#9ca3af,stroke-width:2px,color:#1f2937
    classDef dashboard fill:#dbeafe,stroke:#3b82f6,stroke-width:2px,color:#1e3a8a
    classDef feature fill:#e0e7ff,stroke:#6366f1,stroke-width:2px,color:#3730a3
    classDef modal fill:#fef3c7,stroke:#f59e0b,stroke-width:2px,color:#92400e
    classDef kiosk fill:#dcfce7,stroke:#22c55e,stroke-width:2px,color:#14532d

    %% Auth Flow
    Start([User Visits Website]) --> Login[Login Page\n/login]:::auth
    Login -->|JWT Authenticated| AuthCheck{Role?}
    
    %% Role Fork
    AuthCheck -->|Receptionist| Kiosk[Kiosk Check-in Mode\n/kiosk]:::kiosk
    AuthCheck -->|Owner / Coach| Dashboard[Main Dashboard\n/dashboard]:::dashboard

    %% Kiosk
    Kiosk -->|Scans Member QR| SuccessModal[Check-in Success Alert]:::modal
    SuccessModal -.-> Kiosk

    %% Main Navigation
    Dashboard --> Members[Members Management\n/members]:::feature
    Dashboard --> Fees[Fee Management\n/fees]:::feature
    Dashboard --> Workouts[Workout Planner\n/workouts/planner]:::feature
    Dashboard --> Diets[Diet Charts\n/diets]:::feature
    Dashboard --> Notifications[Send Broadcasts\n/notifications]:::feature
    Dashboard --> Settings[Gym Settings\n/settings]:::feature

    %% Deep Links (Members)
    Members --> AddMember[Add New Member\n/members/new]:::modal
    Members --> MemberProfile[Member Details\n/members/:id]:::feature
    
    %% Member Profile Tabs
    MemberProfile --> ProfileOverview(Overview Tab)
    MemberProfile --> ProfileAttendance(Attendance Heatmap)
    MemberProfile --> ProfileProgress(Body Stats Charts)
    MemberProfile --> ProfileFees(Payment History)

    %% Deep Links (Fees)
    Fees --> CollectFee[Collect Payment\n/payments/collect]:::modal
    CollectFee -->|Generates| Invoice[PDF Invoice]
```

---

## 2. Flutter Mobile App
**Audience:** Gym Members

```mermaid
flowchart TD
    %% Define Styles
    classDef init fill:#f3f4f6,stroke:#9ca3af,stroke-width:2px,color:#1f2937
    classDef nav fill:#fce7f3,stroke:#ec4899,stroke-width:2px,color:#831843
    classDef screen fill:#fdf2f8,stroke:#f472b6,stroke-width:2px,color:#9d174d
    classDef action fill:#fef3c7,stroke:#f59e0b,stroke-width:2px,color:#92400e

    %% Startup Flow
    Splash[Splash Screen]:::init --> AuthCheck{Logged In?}
    AuthCheck -->|No| Login[Login Screen\nPhone OTP]:::init
    Login -->|MSG91 OTP Success| Home

    AuthCheck -->|Yes| Home[Home Dashboard\nBottom Nav Bar]:::nav

    %% Bottom Navigation
    Home --> TabHome[🏠 Home Tab]:::screen
    Home --> TabProgress[📈 Progress Tab]:::screen
    Home --> TabNotifications[🔔 Notifications Tab]:::screen
    Home --> TabProfile[👤 Profile Tab]:::screen

    %% Home Screen Actions
    TabHome --> DailyWorkout[View Today's Workout]:::action
    TabHome --> DailyDiet[View Today's Diet]:::action
    TabHome --> Attendance[View Attendance Streak]:::action

    %% Progress Actions
    TabProgress --> LogStats[Log New Body Stats\nWeight, Biceps, etc.]:::action
    TabProgress --> ViewCharts[View FlChart Trends]:::action

    %% Profile Actions
    TabProfile --> ShowQR[Display Dynamic Check-in QR]:::action
    TabProfile --> Subscription[View Plan Expiry & Fees]:::action
    TabProfile --> Logout[Logout]:::init
    
    %% Kiosk Connection
    ShowQR -.->|Scanned by Reception Tablet| KioskCheckIn[(GymOS API Check-in)]
```
