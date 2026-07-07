# Requirements Document

## 1. Application Overview

### 1.1 Application Name
Apprenix v3.3 - Multi-profile educational platform with 100,000+ content items

### 1.2 Description
100% free and ad-free educational platform offering 100,093 educational items (3,064 quizzes, 156 flashcard packs, 96,846 flashcards, 27 method sheets). This version introduces differentiated user experiences for 4 profiles (students, teachers, parents, visitors) and comprehensive multi-screen compatibility (mobile 375px to 4K screen 3840px, TV, projector). Now includes a dedicated public-facing portal (Espace Public) for institutional transparency and accessibility.

### 1.3 Existing Context
- Supabase database with 100,093 educational items
- Tables: quiz_questions, flashcard_packs, flashcards, fiches_methode, profiles, teacher_extra
- Current pages: Home, Quiz, Flashcards, Method Sheets, Planning
- Authentication via Supabase
- Student and teacher spaces operational

### 1.4 Scope of This Update
- Homepage redesign with animated 100K+ counter
- Creation of 4 distinct user journeys (student/teacher/parent/visitor)
- Content reorganization by school level (Primary, Brevet, Bac, Higher Education)
- Complete responsive adaptation (375px to 3840px, TV, projector)
- Browser compatibility: Chrome, Firefox, Opera, Edge, Safari, Samsung Internet, Brave
- Update of Quiz and Flashcards pages to reflect actual content volume
- **New: Public portal (Espace Public) with homepage and information page**

## 2. Users and Usage Scenarios

### 2.1 Target Users

#### 2.1.1 Students
- From CP to Bac+5
- Need quick access to revision resources

#### 2.1.2 Teachers
- Teachers from primary to higher education
- Search for educational resources by subject and level

#### 2.1.3 Parents
- Parents of students from primary to high school
- Monitoring their children's progress

#### 2.1.4 Visitors
- Unregistered users
- Discovering the platform before registration

#### 2.1.5 Auditors/Inspectors
- Evaluating regulatory and procedural compliance
- Verifying institutional credibility

### 2.2 Main Scenarios

#### Student
- Accesses homepage and sees 100K+ items counter
- Navigates to Quiz section and filters by level (Primary/Brevet/Bac/Higher Education)
- Consults 156 flashcard packs organized by subject
- Accesses revision planning
- Consults progress

#### Teacher
- Accesses homepage and selects Teacher profile
- Consults available content by subject and level
- Accesses educational resources
- Creates new content

#### Parent
- Accesses monitoring dashboard
- Consults child's progress
- Views child's revision planning

#### Visitor
- Discovers homepage with presentation of 4 profiles
- Consults content statistics (100K+ items)
- Views available subjects
- Clicks on registration CTA adapted to their profile

#### Auditor/Inspector
- Accesses Espace Public portal
- Verifies legal notices, accreditations, compliance information
- Evaluates accessibility statement
- Reviews procedures and regulatory compliance

## 3. Page Structure and Functionalities

### 3.1 Database Architecture

#### Existing tables (unchanged)
- quiz_questions (3,064 items)
- flashcard_packs (156 packs)
- flashcards (96,846 items)
- fiches_methode (27 items)
- profiles
- teacher_extra

### 3.2 Homepage (complete redesign)

#### 3.2.1 Hero section
- Main title: Apprenix - 100% free, 0 ads
- Animated counter displaying 100,093 educational items
- Subtitle: From CP to Bac+5
- Main CTA: Start for free

#### 3.2.2 User profiles section
- 4 clickable cards: Student, Teacher, Parent, Visitor
- Each card displays:
  - Representative icon
  - Profile title
  - Short description (1 sentence)
  - Access button

#### 3.2.3 Available subjects section
- List of subjects: Mathematics, French, History-Geography, SVT, Physics-Chemistry, SES, Philosophy, NSI, Languages
- Display of number of items per subject

#### 3.2.4 Visual statistics section
- Total number of flashcards: 96,846
- Total number of quizzes: 3,064
- Number of flashcard packs: 156
- Number of method sheets: 27
- Levels covered: Primary, Middle School, High School, Higher Education

#### 3.2.5 CTA section by profile
- Student CTA: Access flashcards
- Teacher CTA: Discover resources
- Parent CTA: Monitor my child
- Visitor CTA: Register for free

### 3.3 Navigation Adapted by Profile

#### 3.3.1 Student Menu
- Home
- Quiz
- Flashcards
- Method Sheets
- Planning
- My Progress

#### 3.3.2 Teacher Menu
- Home
- Content by Subject
- Content by Level
- Educational Resources
- Create Content

#### 3.3.3 Parent Menu
- Home
- Dashboard
- Child Progress
- Child Planning

#### 3.3.4 Visitor Menu
- Home
- Discover
- Register

### 3.4 Content Pages by Level

#### 3.4.1 Primary Page
- Display of content for CP, CE1, CE2, CM1, CM2
- Filters by subject
- Access to quizzes, flashcards, method sheets of the level

#### 3.4.2 Brevet Page
- Display of content for 6th, 5th, 4th, 3rd grade
- Filters by subject
- Access to quizzes, flashcards, method sheets of the level

#### 3.4.3 Bac Page
- Tabs: General, Technological
- Display of content for Seconde, Première, Terminale
- Filters by subject and specialty
- Access to quizzes, flashcards, method sheets of the level

#### 3.4.4 Higher Education Page
- Display of content for Bac+1 to Bac+5
- Filters by subject and domain
- Access to quizzes, flashcards, method sheets of the level

### 3.5 Quiz Page (update)

#### 3.5.1 Header
- Title: 3,064 quizzes available
- Filters: Level (Primary/Brevet/Bac/Higher Education), Subject, Text search

#### 3.5.2 Quiz list
- Paginated display (20 quizzes per page)
- Each quiz displays: question, subject, level, set_label
- Load more button

#### 3.5.3 Quiz display
- Question
- Answer (hidden by default, displayed on click)
- Subject
- Level

### 3.6 Flashcards Page (update)

#### 3.6.1 Header
- Title: 156 flashcard packs - 96,846 cards
- Filters: Level (Primary/Brevet/Bac/Higher Education), Subject, Text search

#### 3.6.2 Pack list
- Paginated display (20 packs per page)
- Each pack displays: name, subject, level, number of cards
- Open pack button

#### 3.6.3 Pack detail
- Pack name
- Subject and level
- List of flashcards (front/back)
- Previous/next navigation

### 3.7 Method Sheets Page (update)

#### 3.7.1 Header
- Title: 27 method sheets available
- Filters: Level (Primary/Brevet/Bac/Higher Education), Subject, Text search

#### 3.7.2 Sheet list
- Paginated display (20 sheets per page)
- Each sheet displays: title, subject, level
- Consult sheet button

#### 3.7.3 Sheet detail
- Title
- Subject and level
- Steps (numbered list)
- Advice (if available)
- Example (if available)

### 3.8 Parent Dashboard

#### 3.8.1 Overview
- Child's name
- School level
- Last connection

#### 3.8.2 Progress
- Number of completed quizzes
- Number of consulted flashcards
- Number of consulted method sheets
- Weekly progress graph

#### 3.8.3 Planning
- Display of child's revision planning
- Upcoming scheduled sessions

### 3.9 Educational Resources (Teacher)

#### 3.9.1 Content by Subject
- List of available subjects
- Number of items per subject
- Access to quizzes, flashcards, method sheets of the subject

#### 3.9.2 Content by Level
- List of levels (Primary, Brevet, Bac, Higher Education)
- Number of items per level
- Access to quizzes, flashcards, method sheets of the level

### 3.10 Espace Public Portal (new)

#### 3.10.1 Espace Public Homepage (/espace-public)

##### Hero Section
- Main title: Espace Public - Institutional Transparency
- Subtitle: Access all institutional information and compliance documentation
- Powerful search bar for quick information retrieval

##### Quick Access by User Type
- 4 cards: Student (first visit), Parent, Teacher, Auditor/Inspector
- Each card displays:
  - Icon
  - User type label
  - Brief description of relevant information
  - Access button to filtered content

##### Key Credibility Signals
- Accreditations display
- Legal compliance badges
- Contact information (email, phone)
- Support CTA

##### Platform Statistics
- 100,093 educational items
- 100% free and ad-free
- Levels covered: Primary to Higher Education

##### How It Works (3 steps)
- Step 1: Register for free
- Step 2: Choose your profile
- Step 3: Access content

##### Compliance & Legal Quick Access
- Links to: Legal notices, Privacy policy, Accessibility statement, Procedures

##### FAQ Snippet
- 3-5 most frequently asked questions with answers
- Link to full FAQ

##### Contact/Support CTA
- Contact form link
- Support email
- Response time commitment

#### 3.10.2 Information Page (/espace-public/informations)

##### Legal Notices Section
- Publisher information
- Hosting information
- Intellectual property
- Terms of use

##### Privacy Policy Section
- Summary of data collection practices
- Link to full privacy policy
- GDPR compliance statement

##### Accreditations Section
- List of institutional accreditations
- Certification badges
- Validation dates

##### Procedures & Regulatory Compliance Section
- Educational procedures
- Quality assurance processes
- Regulatory compliance documentation

##### Accessibility Statement Section
- WCAG compliance level
- RGAA compliance statement
- Accessibility features list
- Contact for accessibility issues

#### 3.10.3 Navigation Component
- Hierarchical sitemap structure
- Breadcrumb navigation
- Consistent menu across Espace Public pages
- Multiple access paths: menu + search + quick links + breadcrumbs

### 3.11 Responsive Design

#### 3.11.1 Mobile (375px, 390px, 414px, 430px)
- Hamburger menu
- Vertical navigation
- Stacked cards
- Adapted texts (minimum size 14px)
- Touch buttons (minimum height 44px)

#### 3.11.2 Tablet (768px, 834px, 1024px)
- Horizontal or side menu
- 2-column grid
- Adapted texts (minimum size 16px)

#### 3.11.3 Computer (1280px, 1366px, 1440px, 1920px)
- Full horizontal menu
- 3-4 column grid
- Optional sidebar
- Standard texts (size 16-18px)

#### 3.11.4 Large screen (2560px, 3840px)
- 4-6 column grid
- Increased spacing
- Large texts (size 18-24px)
- Centered container (max-width 2400px)

#### 3.11.5 Projector (16:9, 4:3 ratio)
- High contrast
- Very large texts (size 24-32px)
- Simplified navigation
- Large buttons

#### 3.11.6 TV/Smart TV
- Keyboard/remote navigation
- Visible focus on interactive elements
- Very large texts (size 28-36px)
- Increased spacing between elements

## 4. Business Rules and Logic

### 4.1 Statistics Display
- The 100K+ counter on homepage displays 100,093 items
- Detailed statistics display exact figures: 3,064 quizzes, 156 packs, 96,846 flashcards, 27 sheets
- Counters are updated in real-time from Supabase

### 4.2 Filtering by Level
- Primary: CP, CE1, CE2, CM1, CM2
- Brevet: 6th, 5th, 4th, 3rd grade
- Bac: Seconde, Première, Terminale (General and Technological)
- Higher Education: Bac+1, Bac+2, Bac+3, Bac+4, Bac+5

### 4.3 Flashcard Pack Organization
- 156 packs are organized by subject and level
- Each pack displays the number of cards it contains
- Total of 96,846 flashcards is displayed in header

### 4.4 User Journey by Profile
- Student: direct access to revision content
- Teacher: access to content organized by subject/level + content creation
- Parent: access to child monitoring dashboard
- Visitor: limited access to homepage and discovery, registration CTA

### 4.5 Espace Public Access Rules
- Accessible to all users (registered and unregistered)
- No authentication required
- Search functionality available to all
- Information organized by user type for quick access

### 4.6 Responsive Design
- Layout automatically adapts to detected screen width
- Breakpoints are: 375px, 768px, 1024px, 1280px, 1920px, 2560px
- Texts and buttons respect minimum sizes according to screen type
- Navigation is adapted (hamburger on mobile, horizontal on desktop)

### 4.7 Browser Compatibility
- Site works on Chrome, Firefox, Opera, Edge, Safari, Samsung Internet, Brave
- JavaScript functionalities are tested on all browsers
- CSS styles use vendor prefixes if necessary

### 4.8 Free and Ad-Free
- All content remains 100% free
- No ads are displayed
- No subscription required

### 4.9 Accessibility Compliance
- WCAG 2.1 Level AA compliance
- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader compatible
- Adjustable text size and contrast
- Focus indicators visible

## 5. Exceptional Situations and Edge Cases

| Situation | Expected Behavior |
|-----------|------------------|
| Visitor attempts to access page reserved for registered users | Redirect to registration page with explanatory message |
| Parent has not yet linked child account | Message: Please link your child's account in settings |
| Teacher accesses subject with no content | Message: No content available for this subject currently |
| Student filters by level with no results | Message: No content matches your criteria |
| Screen detected outside defined breakpoints | Use closest breakpoint |
| Unsupported browser (IE11) | Message: Please use a modern browser for optimal experience |
| Supabase connection fails | Display error message, automatic retry |
| 100K+ counter does not load | Display placeholder: 100,000+ items |
| User changes profile during session | Reload navigation and content adapted to new profile |
| Tablet in landscape mode | Use computer breakpoint (1024px) |
| Tablet in portrait mode | Use tablet breakpoint (768px) |
| TV detected as large screen | Activate TV mode (keyboard navigation, large texts) |
| Projector detected | Activate projector mode (high contrast, very large texts) |
| User zooms on page | Responsive adaptation according to zoom level |
| User disables JavaScript | Message: JavaScript is required to use Apprenix |
| User uses screen reader | ARIA attributes present on all interactive elements |
| Empty flashcard pack | Message: This pack contains no cards at the moment |
| Quiz without answer | Message: Answer not available |
| Method sheet without advice or example | Display only title, subject, level and steps |
| Student reaches end of pagination | Message: You have consulted all available content |
| Parent consults progress without data | Message: No activity recorded at the moment |
| Espace Public search returns no results | Message: No results found. Try different keywords or browse by category |
| Accessibility statement page fails to load | Display cached version with notice |
| User accesses Espace Public from mobile with slow connection | Progressive loading with skeleton screens |

## 6. Acceptance Criteria

1. Access homepage and verify display of 100,093 items counter
2. Verify counter animation on page load
3. Verify display of 4 profile cards (Student, Teacher, Parent, Visitor)
4. Click on each profile card and verify redirection
5. Verify display of available subjects section
6. Verify display of statistics: 96,846 flashcards, 3,064 quizzes, 156 packs, 27 sheets
7. Verify display of CTAs according to profile
8. Log in as Student and verify adapted menu
9. Access Quiz page and verify display of title: 3,064 quizzes available
10. Apply filter by level (Primary) and verify filtering
11. Apply filter by subject (Mathematics) and verify filtering
12. Perform text search and verify results
13. Access Flashcards page and verify display of title: 156 flashcard packs - 96,846 cards
14. Verify display of 156 packs organized by subject and level
15. Open a pack and verify display of number of cards
16. Consult flashcards in pack (front/back)
17. Access Method Sheets page and verify display of title: 27 method sheets available
18. Consult a sheet and verify display of steps, advice, example
19. Access Primary page and verify display of CP to CM2 content
20. Access Brevet page and verify display of 6th to 3rd grade content
21. Access Bac page and verify General/Technological tabs
22. Access Higher Education page and verify display of Bac+1 to Bac+5 content
23. Log in as Teacher and verify adapted menu
24. Access Content by Subject and verify display
25. Access Content by Level and verify display
26. Log in as Parent and verify adapted menu
27. Access Dashboard and verify display of child's progress
28. Access Child Planning and verify display
29. Log out and verify Visitor menu
30. Test homepage on mobile 375px and verify hamburger menu
31. Test homepage on mobile 414px and verify display
32. Test homepage on tablet 768px and verify 2-column grid
33. Test homepage on tablet 1024px and verify display
34. Test homepage on computer 1280px and verify horizontal menu
35. Test homepage on computer 1920px and verify 3-4 column grid
36. Test homepage on large screen 2560px and verify 4-6 column grid
37. Test homepage on 4K screen 3840px and verify centered container
38. Test homepage on 16:9 projector and verify large texts
39. Test homepage on TV and verify keyboard navigation
40. Test compatibility on Chrome and verify functionality
41. Test compatibility on Firefox and verify functionality
42. Test compatibility on Opera and verify functionality
43. Test compatibility on Edge and verify functionality
44. Test compatibility on Safari and verify functionality
45. Test compatibility on Samsung Internet and verify functionality
46. Test compatibility on Brave and verify functionality
47. Verify texts on mobile have minimum size of 14px
48. Verify buttons on mobile have minimum height of 44px
49. Verify texts on tablet have minimum size of 16px
50. Verify texts on computer have size of 16-18px
51. Verify texts on large screen have size of 18-24px
52. Verify texts on projector have size of 24-32px
53. Verify texts on TV have size of 28-36px
54. Verify high contrast on projector
55. Verify visible focus on TV during keyboard navigation
56. Verify increased spacing between elements on TV
57. Verify content remains 100% free
58. Verify no ads are displayed
59. Verify no subscription is required
60. Verify statistics are updated in real-time from Supabase
61. Verify filters by level work correctly
62. Verify filters by subject work correctly
63. Verify text search works correctly
64. Verify pagination works correctly (20 items per page)
65. Verify Load more button works correctly
66. Verify profile change reloads adapted navigation
67. Verify tablet in landscape mode uses 1024px breakpoint
68. Verify tablet in portrait mode uses 768px breakpoint
69. Verify zoom adapts responsive design
70. Verify ARIA attributes are present for accessibility
71. Access Espace Public homepage (/espace-public) and verify hero section display
72. Verify display of 4 user type quick access cards (Student/Parent/Teacher/Auditor)
73. Verify search bar functionality on Espace Public homepage
74. Verify display of key credibility signals (accreditations, legal compliance, contact)
75. Verify display of platform statistics on Espace Public homepage
76. Verify display of How It Works 3-step section
77. Verify display of Compliance & Legal quick access links
78. Verify display of FAQ snippet with 3-5 questions
79. Verify Contact/Support CTA functionality
80. Access Information page (/espace-public/informations) and verify Legal Notices section
81. Verify display of Privacy Policy section with summary and full policy link
82. Verify display of Accreditations section with badges and dates
83. Verify display of Procedures & Regulatory Compliance section
84. Verify display of Accessibility Statement section with WCAG/RGAA compliance
85. Verify hierarchical navigation component on Espace Public pages
86. Verify breadcrumb navigation on Espace Public pages
87. Verify multiple access paths (menu + search + quick links + breadcrumbs)
88. Test Espace Public homepage on mobile 375px and verify touch targets ≥44px
89. Test Espace Public homepage on tablet 768px and verify layout
90. Test Espace Public homepage on desktop 1920px and verify layout
91. Verify Espace Public search returns relevant results
92. Verify Espace Public search handles no results gracefully
93. Verify keyboard navigation on Espace Public pages
94. Verify screen reader compatibility on Espace Public pages
95. Verify focus indicators on all interactive elements in Espace Public
96. Verify adjustable text size on Espace Public pages
97. Verify high contrast mode on Espace Public pages
98. Verify Espace Public pages load quickly on slow connections
99. Test Espace Public on all supported browsers (Chrome, Firefox, Opera, Edge, Safari, Samsung Internet, Brave)
100. Verify all links in Espace Public navigate correctly

## 7. Features Not Implemented in This Version

- Bidirectional synchronization between inline JS and Supabase
- Content versioning
- Comment system
- Content rating
- Personalized recommendations
- Detailed usage statistics
- PDF export of content
- Content sharing between users
- Content duplication
- Content archiving
- Automatic moderation
- Duplicate content detection
- Automatic translation
- AI-generated content
- Import from external sources
- Public API
- Webhooks
- Advanced client-side caching
- Full offline mode with synchronization
- Advanced search with boolean operators
- Multi-tag search
- Advanced filters (date, author)
- Custom sorting
- Favorite filter saving
- Search history
- Automatic search suggestions
- Spell checking
- Voice search
- Image search
- Mathematical formula recognition
- LaTeX editor
- Rich media support (videos, audios)
- Interactive simulation integration
- Augmented reality
- Gamification (badges, points)
- Challenges and competitions
- Leaderboards
- Reward system
- Premium content marketplace
- Premium subscriptions
- Targeted advertising
- Content monetization
- Publisher partnerships
- Institutional licenses
- Quality certification
- Institutional accreditations
- Alignment with official curricula
- Competency framework alignment
- School management system integration
- SCORM export
- LTI integration
- Single Sign-On (SSO)
- Granular access rights management
- Private content
- Paid content
- Recurring subscriptions
- Free trials
- Promo codes
- Referral programs
- Affiliation
- Advanced analytics
- Performance dashboards
- Detailed usage reports
- Engagement insights
- Success prediction
- Adaptive recommendations
- Personalized learning paths
- Placement tests
- Formative assessments
- Automated feedback
- Automatic correction
- Progress report generation
- Automated report cards
- Longitudinal competency tracking
- Digital portfolio
- Automated educational CV
- Recommendation letters
- Competency certification
- Verifiable digital diplomas
- Blockchain for traceability
- Open Badges
- International recognition
- Diploma equivalencies
- Academic mobility
- Credit transfer
- Portable student record
- Interoperability with other platforms
- International educational standards
- Enhanced GDPR compliance
- End-to-end encryption
- Two-factor authentication
- Regular security audits
- Automatic backup
- Geographic redundancy
- Disaster recovery plan
- Guaranteed high availability
- 99.9% SLA
- 24/7 technical support
- Multilingual assistance
- Complete documentation
- Video tutorials
- Training webinars
- Community of practice
- Discussion forum
- Live chat
- Support tickets
- Knowledge base
- Dynamic FAQ
- Chatbot for assistance
- AI for support
- Sentiment analysis
- Continuous improvement based on feedback
- Public roadmap
- Voting for prioritization
- Beta testing
- Early adopter program
- Partnerships with pilot institutions
- Educational research and development
- Scientific publications
- Longitudinal studies
- Laboratory collaboration
- Pedagogical innovation
- New method experimentation
- Technology watch
- Consortium participation
- Conferences and symposiums
- Innovation awards
- Community recognition
- Quality labels
- Educational certifications
- Institutional accreditations
- External quality audits
- Total transparency
- Public annual reports
- Published performance indicators
- Quantified quality objectives
- Continuous improvement commitment
- User-generated content in Espace Public
- Multi-language support for Espace Public
- Advanced filtering in Espace Public search
- Downloadable compliance documents
- Interactive compliance checklist
- Automated compliance reporting
- Real-time chat support in Espace Public
- Scheduled tours for auditors
- Video presentations of procedures
- Interactive FAQ with AI assistance