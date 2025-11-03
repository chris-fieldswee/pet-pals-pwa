# Health Overview Feature - Implementation Plan

## Overview
This document outlines the implementation plan for the Health Overview Screen, providing a comprehensive health tracking system for pets.

## Database Schema

### Tables Created

1. **health_records** - All health-related events
   - Vet visits, vaccinations, medications, surgeries, etc.
   - Supports 8 different record types
   - Tracks dates, descriptions, medication details, vet info

2. **health_vitals** - Vital signs tracking
   - Weight, temperature, heart rate, respiratory rate, etc.
   - Time-series data for trend analysis
   - Supports graphing and historical tracking

3. **health_alerts** - Reminders and notifications
   - Vaccinations due, medications, checkups, follow-ups
   - Priority levels (low, medium, high, urgent)
   - Status tracking (active, snoozed, completed, cancelled)
   - Snooze and reschedule functionality

4. **health_documents** - File attachments
   - Lab results, X-rays, prescriptions, invoices
   - Links to Supabase Storage
   - Associated with health records

### Key Features

- **Row Level Security (RLS)** - All tables secured with user-based access
- **Automatic Timestamps** - Triggers for updated_at fields
- **Optimized Indexes** - Fast queries by pet, date, type
- **Health Summary View** - Quick access to latest vitals and alert counts

## Frontend Implementation Plan

### 1. Health Overview Screen (`HealthOverview.tsx`)

**Route:** `/pet/:petId/health/overview`

**Components Structure:**
```
HealthOverview
├── HealthSummaryCard
├── VitalsTracker
│   ├── WeightChart
│   ├── TemperatureChart
│   └── HeartRateChart
├── AlertsSection
│   ├── AlertCard (with actions: Done, Reschedule, Snooze)
│   └── UpcomingAlertsList
├── RecentHealthEvents
│   └── EventTimelineItem
└── QuickActionsBar (Floating +)
```

### 2. Section Details

#### A. Pet Health Summary Card
**Data Sources:**
- Pet profile (age, breed, weight)
- Latest weight from `health_vitals`
- Last checkup from `health_records` (record_type = 'vet_visit')
- Active alerts count from `health_alerts`

**Display:**
- Age (calculated from birth_date)
- Breed
- Latest weight with unit
- Last checkup date
- CTA buttons: "Add Record", "Log Vital"

#### B. Vitals Tracker
**Data Source:** `health_vitals` table

**Graphs to Display:**
1. **Weight Trend** - Line chart showing weight over time
   - Filter: Last 30 days, 3 months, 6 months, 1 year
   - Tap → Detailed weight history with entry points

2. **Temperature Trend** - Line chart (if data available)
   - Normal range overlay (dogs: 101-102.5°F, cats: 100.5-102.5°F)

3. **Heart Rate Trend** - Line chart (if data available)
   - Normal range overlay (dogs: 60-140 bpm, cats: 140-220 bpm)

**Implementation:**
- Use `recharts` library (already in dependencies)
- Tap on chart → Navigate to detailed vitals page
- "Add Vital" button for each chart

#### C. Upcoming & Active Alerts
**Data Source:** `health_alerts` table filtered by:
- `status = 'active'`
- `due_date <= current_date + 7 days` (for upcoming)
- Ordered by `due_date ASC`, then `priority DESC`

**Alert Card Components:**
- Alert type icon (vaccination, medication, etc.)
- Title and description
- Due date with countdown ("Due in 3 days", "Due tomorrow", "Overdue")
- Priority badge (color-coded)
- Actions:
  - ✅ **Mark as Done** - Updates `status = 'completed'`, sets `completed_at`
  - 📅 **Reschedule** - Opens date picker, updates `due_date`, tracks `rescheduled_from/to`
  - ⏰ **Snooze** - Opens snooze options (1 day, 3 days, 1 week), updates `status = 'snoozed'`, sets `snoozed_until`

**Display:**
- Group by: "Overdue", "Due Today", "Due This Week"
- Color coding:
  - Red: Overdue or Urgent
  - Orange: Due within 3 days
  - Yellow: Due within 7 days
  - Blue: Low priority

#### D. Recent Health Events Timeline
**Data Source:** `health_records` table
- Ordered by `date DESC`, then `created_at DESC`
- Limit to last 10-15 records
- Tap → Open record detail modal/page

**Timeline Items Display:**
- Icon based on `record_type`
  - Vet Visit: 🏥 or FileText icon
  - Vaccination: 💉 or Syringe icon
  - Medication: 💊 or Pill icon
  - Weight Log: 📊 or Scale icon
- Date (formatted: "Oct 10" or "Today", "Yesterday")
- Title (`title` field)
- Brief description (truncated)
- Time if available

**Record Types:**
- Vet Visit
- Vaccine Record
- Weight Logged
- Medication Started
- Surgery
- Allergy Recorded
- Diagnosis
- General Note

#### E. Quick Actions Bar (Floating +)
**Position:** Fixed bottom-right, floating button

**Actions Menu (opens on tap):**
1. **Add New Record**
   - Opens modal/drawer with record type selector
   - Types: Vet Visit, Vaccination, Medication, Weight Log, Surgery, Allergy, Diagnosis, General

2. **Log Vital**
   - Opens modal with vital type selector
   - Types: Weight, Temperature, Heart Rate, Respiratory Rate, etc.
   - Quick input form with value and unit

3. **Upload Document**
   - File picker
   - Upload to Supabase Storage bucket `health-documents`
   - Create entry in `health_documents` table
   - Option to link to existing `health_record`

4. **Share Health Profile**
   - Generate shareable link or PDF export
   - Summary of health records (optional feature)

### 3. Additional Pages/Components

#### Health Record Detail Modal/Page
- Full details of a health record
- Edit/Delete capabilities
- Linked documents
- Related alerts

#### Vitals Detail Page
- Full history of a specific vital type
- Advanced filtering
- Export data option
- Add new measurement inline

#### Alert Management Page
- View all alerts (active, completed, snoozed)
- Filter by type, priority, status
- Bulk actions
- Alert history

## Implementation Steps

### Phase 1: Database Setup
- [x] Create migration file
- [ ] Run migration in Supabase
- [ ] Set up storage bucket for documents
- [ ] Create storage policies
- [ ] Update TypeScript types

### Phase 2: Core Components
- [ ] Create `HealthOverview.tsx` page
- [ ] Create `HealthSummaryCard` component
- [ ] Create `VitalsTracker` component with charts
- [ ] Create `AlertsSection` component
- [ ] Create `RecentHealthEvents` timeline component
- [ ] Create `QuickActionsBar` floating button

### Phase 3: Alert System
- [ ] Create alert card component
- [ ] Implement "Mark as Done" action
- [ ] Implement "Reschedule" action with date picker
- [ ] Implement "Snooze" action with options
- [ ] Alert notifications (optional - future enhancement)

### Phase 4: Record Management
- [ ] Create record type selector
- [ ] Create forms for each record type
- [ ] Create record detail modal/page
- [ ] Edit/Delete functionality

### Phase 5: Vitals Tracking
- [ ] Create vitals input form
- [ ] Implement charts using recharts
- [ ] Create vitals detail page
- [ ] Historical data filtering

### Phase 6: Document Management
- [ ] File upload component
- [ ] Document preview (images, PDFs)
- [ ] Document linking to records
- [ ] Document deletion

### Phase 7: Integration & Testing
- [ ] Link Health Overview to navigation
- [ ] Update Health Log page to use new schema
- [ ] Test all CRUD operations
- [ ] Test RLS policies
- [ ] Performance optimization

## API Queries Needed

### Get Health Summary
```sql
SELECT * FROM health_summary WHERE pet_id = $1;
```

### Get Latest Vitals
```sql
SELECT * FROM health_vitals 
WHERE pet_id = $1 AND vital_type = $2
ORDER BY measured_at DESC 
LIMIT 1;
```

### Get Vitals for Chart
```sql
SELECT measured_at, value, unit 
FROM health_vitals 
WHERE pet_id = $1 AND vital_type = $2
ORDER BY measured_at ASC;
```

### Get Active Alerts
```sql
SELECT * FROM health_alerts 
WHERE pet_id = $1 AND status = 'active'
ORDER BY due_date ASC, priority DESC;
```

### Get Recent Health Events
```sql
SELECT * FROM health_records 
WHERE pet_id = $1
ORDER BY date DESC, created_at DESC
LIMIT 15;
```

## UI/UX Considerations

1. **Mobile-First Design**
   - Optimize for small screens
   - Touch-friendly buttons and cards
   - Swipe actions for alerts (optional)

2. **Visual Hierarchy**
   - Most important info at top (Summary, Active Alerts)
   - Charts in middle for quick reference
   - Timeline at bottom for detailed history

3. **Empty States**
   - Friendly messages when no data
   - Clear CTAs to add first record
   - Helpful tooltips

4. **Loading States**
   - Skeleton loaders for charts
   - Progressive loading

5. **Error Handling**
   - Graceful error messages
   - Retry mechanisms
   - Offline support (future)

## Future Enhancements

1. **Notifications**
   - Push notifications for alerts
   - Email reminders
   - SMS alerts (premium feature)

2. **Export & Sharing**
   - PDF health report generation
   - Share with vet via email
   - CSV export for data analysis

3. **Advanced Analytics**
   - Health trends analysis
   - Predictive alerts
   - Comparison with breed averages

4. **Vet Integration**
   - Vet portal access
   - Appointment scheduling
   - Direct record sharing

5. **Medication Tracking**
   - Medication schedule calendar
   - Refill reminders
   - Dosage tracking

6. **AI Features**
   - Symptom checker
   - Health insights
   - Anomaly detection in vitals

## Notes

- The existing `HealthLog.tsx` page uses the `activities` table with `activity_type = 'health'`. Consider migrating existing data or keeping both systems in parallel.
- Weight can be stored both in `pets.weight_lbs` (current weight) and `health_vitals` (historical tracking). Use vitals for charts, profile field for quick access.
- Alert generation can be automated:
  - When vaccination record added → create alert for next due date
  - When medication record added → create refill alerts based on duration
- Consider adding a `health_settings` table for user preferences (notification preferences, alert thresholds, etc.)

