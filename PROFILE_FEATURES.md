# CertiTask Profile & Company Detail Features

## Overview
This document outlines the new profile pages and company detail functionality added to CertiTask.

## Features Implemented

### 1. Company Detail Page (`/companies/[id]`)
**File**: `app/companies/[id]/page.tsx`

#### Features:
- Displays comprehensive company information
- Shows company logo, name, industry, location, and size
- Lists all open projects with application counts
- Contact information section with email, phone, website, LinkedIn
- Activity statistics (total projects)
- Member since date
- Responsive design with sidebar on desktop

#### Data Fetched From:
- `GET /api/companies/[id]` - Retrieves company details from database
- Includes company-specific fields: industry, companySize, foundedYear, companyDescription, etc.
- Shows associated projects with their status and applications

---

### 2. Company Profile Completion Form (`/company/profile`)
**File**: `app/company/profile/page.tsx`

#### Form Fields:
**Basic Information:**
- Company Name (required)
- Industry (required dropdown)
- Company Size (required dropdown)
- Founded Year

**Contact Information:**
- Phone Number
- Location
- Website URL
- LinkedIn URL

**About Section:**
- Company Description (textarea with 500 char recommendation)

#### Features:
- Real-time form validation
- Success notification on submission
- Responsive grid layout
- Back button to companies page

---

### 3. Student Profile Completion Form (`/student/profile`)
**File**: `app/student/profile/page.tsx`

#### Form Sections:

**Personal Information:**
- Full Name (required)
- Email (required)
- Phone Number
- Location
- Date of Birth
- Gender (dropdown)

**CNIC Verification (required):**
- CNIC Number input with format validation (XXXXX-XXXXXXX-X)
- File upload for CNIC image/document
- File size validation (max 5MB)
- CNIC verification button (must verify before profile completion)
- Status indicator (green checkmark when verified)

**Education Information:**
- University Name (required)
- Degree Program (required)
- Current Semester (dropdown: 1-8)
- GPA/CGPA

**Skills & Links:**
- Skills (comma-separated textarea)
- Portfolio URL
- Bio/About section

#### Features:
- Real-time form validation with error messages
- CNIC number format validation
- File upload validation
- Cannot submit form without CNIC verification
- Red error badges on invalid fields
- Success notification on completion
- Responsive design

---

### 4. Company API Endpoint (`/api/companies/[id]`)
**File**: `app/api/companies/[id]/route.ts`

#### Method: GET

#### Response:
```json
{
  "company": {
    "id": "string",
    "name": "string",
    "email": "string",
    "bio": "string",
    "domain": "string",
    "website": "string",
    "logoUrl": "string",
    "phone": "string",
    "location": "string",
    "companySize": "string",
    "industry": "string",
    "foundedYear": "number",
    "companyDescription": "string",
    "companyWebsite": "string",
    "linkedinUrl": "string",
    "createdAt": "ISO datetime",
    "_count": {
      "projects": "number"
    },
    "projects": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "status": "string",
        "deadline": "string",
        "_count": {
          "applications": "number",
          "submissions": "number"
        }
      }
    ]
  }
}
```

---

### 5. Student API Endpoint (`/api/students/[id]`)
**File**: `app/api/students/[id]/route.ts`

#### Method: GET

#### Response:
```json
{
  "student": {
    "id": "string",
    "name": "string",
    "email": "string",
    "bio": "string",
    "phone": "string",
    "dateOfBirth": "string",
    "gender": "string",
    "universityName": "string",
    "degreeProgram": "string",
    "currentSemester": "string",
    "gpa": "number",
    "skillsArray": "string (JSON)",
    "portfolioUrl": "string",
    "resumeUrl": "string",
    "cnicNumber": "string",
    "cnicVerified": "boolean",
    "location": "string",
    "createdAt": "ISO datetime",
    "_count": {
      "applications": "number",
      "submissions": "number",
      "issuedCertificates": "number"
    },
    "applications": [
      {
        "id": "string",
        "status": "string",
        "project": {
          "id": "string",
          "title": "string"
        }
      }
    ]
  }
}
```

---

### 6. Updated Companies Page
**File**: `app/companies/page.tsx`

#### Changes:
- "View Company" button now links to `/companies/[id]` detail page
- Previously showed an alert, now redirects to full company profile
- All company cards now have functional navigation

---

### 7. Database Schema Updates
**File**: `prisma/schema.prisma`

#### New User Model Fields:

**Company-specific:**
- `companySize`: String (e.g., "1-50", "51-200", etc.)
- `industry`: String
- `foundedYear`: Int
- `companyDescription`: String
- `companyWebsite`: String
- `linkedinUrl`: String

**Student-specific:**
- `cnicNumber`: String (unique, optional)
- `cnicVerified`: Boolean (default: false)
- `cnicUploadUrl`: String (URL to uploaded CNIC)
- `dateOfBirth`: String
- `gender`: String
- `universityName`: String
- `degreeProgram`: String
- `currentSemester`: String
- `gpa`: Float
- `skillsArray`: String (JSON array format)
- `portfolioUrl`: String
- `resumeUrl`: String

**General:**
- `phone`: String
- `location`: String

---

## User Flow

### For Companies:
1. Navigate to `/companies` to browse companies
2. Click "View Company" on any company card
3. View full company details including:
   - Company information and about
   - All active projects
   - Contact information and links
   - Activity statistics
4. Can navigate to company profile at `/company/profile` to complete their profile

### For Students:
1. Visit `/student/profile` to complete their profile
2. Fill in personal information
3. **Verify CNIC**: 
   - Enter CNIC number in format: XXXXX-XXXXXXX-X
   - Upload CNIC image/document
   - Click "Verify CNIC" button
   - Once verified, proceed with rest of form
4. Fill in education details
5. Add skills (comma-separated)
6. Add portfolio URL (optional)
7. Submit to complete profile

---

## Validation Rules

### Company Form:
- Company Name: Required
- Industry: Required
- Company Size: Required
- All other fields: Optional

### Student Form:
- Full Name: Required
- Email: Required
- University Name: Required
- Degree Program: Required
- **CNIC Number**: Required format: XXXXX-XXXXXXX-X
- **CNIC File**: Required, must be < 5MB
- **CNIC Verification**: Must be verified before submission

---

## Database Migration

To apply the new schema fields, run:
```bash
npx prisma migrate dev --name add_profile_fields
```

This will:
1. Add all new columns to the `users` table
2. Set default values for boolean fields
3. Update Prisma client types

---

## Testing the Features

### Test Company Detail Page:
1. Go to `/companies`
2. Click "View Company" on any company
3. Should show full company profile with details

### Test Student Profile Form:
1. Go to `/student/profile`
2. Fill in personal information
3. Enter CNIC (example format: 12345-1234567-1)
4. Upload CNIC image
5. Click "Verify CNIC" (simulates verification)
6. Complete education details
7. Add skills
8. Click "Complete Profile"

### Test Company Profile Form:
1. Go to `/company/profile`
2. Fill in company information
3. Click "Save Profile"

---

## Next Steps

### To Complete Full Implementation:
1. **Connect to Database**: Run database migration to add new columns
2. **API Integration**: Update forms to submit data to API endpoints
3. **CNIC Verification**: Implement actual CNIC verification service
4. **File Upload**: Integrate file storage service (S3, Cloudinary, etc.)
5. **Email Verification**: Send verification emails to confirm email addresses
6. **Profile Editing**: Add edit functionality for existing profiles
7. **Profile View**: Create public-facing student and company profiles
8. **Search/Filter**: Add ability to search profiles by skills, location, etc.

---

## File Structure

```
app/
├── companies/
│   └── [id]/
│       └── page.tsx (new company detail page)
├── company/
│   └── profile/
│       └── page.tsx (new company profile form)
├── student/
│   └── profile/
│       └── page.tsx (new student profile form)
├── students/
│   └── [id]/
│       └── page.tsx (new student detail page)
├── api/
│   ├── companies/
│   │   └── [id]/
│   │       └── route.ts (new API endpoint)
│   └── students/
│       └── [id]/
│           └── route.ts (new API endpoint)
└── page.tsx (updated home page query)

prisma/
└── schema.prisma (updated User model)
```

---

## Notes

- All forms include proper error handling and validation
- CNIC verification is mandatory for student profiles
- Company profiles can be edited via the form at `/company/profile`
- Student profiles can be viewed at `/students/[id]` with public information
- Database migration must be run before the app can use new fields
- File uploads need backend integration for actual persistence
