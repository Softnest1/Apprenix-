/**
 * db-types.ts — Types TypeScript exacts correspondant au schéma Supabase
 * Générés d'après information_schema.columns — ne pas modifier manuellement.
 */

/** Préférences d'accessibilité stockées dans profiles.accessibility_prefs */
export interface AccessibilityPrefs {
  profile:       'standard' | 'dys' | 'ulis' | 'malvoyant';
  font:          'inter' | 'luciole' | 'opendyslexic' | 'arial';
  fontSize:      number;
  lineHeight:    number;
  background:    'white' | 'cream' | 'lightblue' | 'lightgray';
  contrast:      'normal' | 'high' | 'veryhigh';
  daltonism:     'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  tts:           boolean;
  syllabation:   boolean;
  falc:          boolean;
  simplifiedNav: boolean;
}

export interface DbTodo {
  id: string;
  user_id: string;
  title: string;
  priority: string;
  due_date: string | null;
  completed: boolean;
  created_at: string;
}

export interface DbCalendarEvent {
  id: string;
  user_id: string;
  title: string;
  event_type: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  subject: string | null;
  notes: string | null;
  created_at: string;
}

export interface DbAiHistory {
  id: string;
  user_id: string;
  question: string;
  subject: string;
  level: string;
  answer: string;
  created_at: string;
}

export interface DbFlashcardDeck {
  id: string;
  user_id: string;
  name: string;
  subject: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface DbFlashcard {
  id: string;
  user_id: string;
  deck_id: string | null;
  question: string;
  answer: string;
  difficulty: string;
  next_review: string;
  review_count: number;
  ease_factor: number;
  created_at: string;
  updated_at: string;
}

export interface DbNote {
  id: string;
  user_id: string;
  title: string;
  content: string;
  subject: string;
  color: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbProfile {
  id: string;
  name: string;
  avatar_url: string | null;
  school_level: string;
  favorite_subjects: string[] | null;
  xp_points: number;
  streak_days: number;
  last_active_date: string | null;
  created_at: string;
  updated_at: string;
  email: string | null;
  security_question: string | null;
  security_answer: string | null;
  role: string;
  avatar_emoji: string | null;
  accessibility_prefs: Record<string, unknown> | null;
  parent_of: string[] | null;
  student_card_number: string | null;
  student_card_school: string | null;
  student_card_year: string | null;
  teacher_institution: string | null;
  teacher_bio: string | null;
  teacher_subjects: string[] | null;
  teacher_levels: string[] | null;
}

export interface DbUserSettings {
  user_id: string;
  dark_mode: boolean;
  notifications: boolean;
  socratic_mode: boolean;
  language: string;
  font_size: string;
  high_contrast: boolean;
  dyslexia_font: boolean;
  updated_at: string;
}

export interface DbRevisionSession {
  id: string;
  user_id: string;
  subject: string;
  duration_min: number;
  score: number | null;
  session_date: string;
  notes_text: string | null;
  created_at: string;
}

export interface DbPomodoroSession {
  id: string;
  user_id: string;
  duration_min: number;
  completed: boolean;
  subject: string;
  session_date: string;
  created_at: string;
}

export interface DbUserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  unlocked_at: string;
}

export interface DbArticle {
  id: string;
  title: string;
  excerpt: string;
  full_summary: string;
  category: string;
  published_at: string;
  read_time: number;
  featured: boolean;
  tags: string[];
  is_admin: boolean;
  created_at: string;
}

export interface DbCommunityQuestion {
  id: string;
  title: string;
  description: string;
  subject: string;
  level: string;
  author_name: string;
  tags: string[];
  created_at: string;
  user_id: string | null;
}

export interface DbCommunityAnswer {
  id: string;
  question_id: string;
  author_name: string;
  author_level: string;
  content: string;
  upvotes: number;
  created_at: string;
  user_id: string | null;
}

export interface DbContentItem {
  id: string;
  type: string;
  title: string;
  body: string;
  author_id: string;
  subject: string;
  level: string[];
  accessibility: string[] | null;
  status: string;
  is_ai_generated: boolean;
  verified_by: string | null;
  verified_at: string | null;
  published_at: string | null;
  attachments: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface DbTeacherProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string | null;
  subjects: string[];
  levels: string[];
  is_available: boolean;
  rating_avg: number;
  rating_count: number;
  response_time_avg_min: number;
  verified: boolean;
  created_at: string;
  updated_at: string;
  avatar_emoji: string;
  institution: string | null;
  is_visible: boolean;
  availability: string;
  max_students: number;
  contact_phone: string | null;
  contact_email: string | null;
  contact_mode: string;
  total_students: number;
}

export interface DbStudentQuestion {
  id: string;
  student_id: string;
  subject: string;
  level: string;
  title: string;
  body: string;
  attachments: string[] | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DbStudentSubmission {
  id: string;
  student_id: string;
  subject: string;
  title: string;
  description: string;
  file_urls: string[];
  file_types: string[];
  status: string;
  teacher_feedback: string | null;
  grade: number | null;
  teacher_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbTeacherAnswer {
  id: string;
  question_id: string;
  teacher_id: string;
  body: string;
  attachments: string[] | null;
  is_official: boolean;
  created_at: string;
}

export interface DbCollaboration {
  id: string;
  student_id: string;
  teacher_id: string;
  request_id: string | null;
  subject: string;
  status: string;
  shared_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbCollaborationMessage {
  id: string;
  collaboration_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface DbCollaborationObjective {
  id: string;
  collaboration_id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DbCollaborationResource {
  id: string;
  collaboration_id: string;
  uploader_id: string;
  title: string;
  resource_type: string;
  url: string;
  created_at: string;
}

export interface DbAccompanimentRequest {
  id: string;
  student_id: string;
  teacher_id: string;
  subject: string;
  message: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DbParentMessage {
  id: string;
  parent_id: string;
  teacher_id: string;
  student_id: string;
  body: string;
  sender_role: string;
  read: boolean;
  created_at: string;
}

export interface DbSiteIntegrityCheck {
  id: string;
  check_type: string;
  target_url: string;
  status: string;
  details: Record<string, unknown> | null;
  checked_at: string;
}

export interface DbAppNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  ref_id: string | null;
  created_at: string;
}
