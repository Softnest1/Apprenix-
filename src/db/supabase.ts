
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Re-export all DB types so pages can import from '@/db/supabase'
export type {
  AccessibilityPrefs,
  DbTodo, DbCalendarEvent, DbAiHistory, DbFlashcardDeck, DbFlashcard,
  DbNote, DbProfile, DbUserSettings, DbRevisionSession, DbPomodoroSession,
  DbUserBadge, DbArticle, DbCommunityQuestion, DbCommunityAnswer,
  DbContentItem, DbTeacherProfile, DbStudentQuestion, DbStudentSubmission,
  DbTeacherAnswer, DbCollaboration, DbCollaborationMessage,
  DbCollaborationObjective, DbCollaborationResource, DbAccompanimentRequest,
  DbParentMessage, DbSiteIntegrityCheck, DbAppNotification,
} from '@/db/db-types';
            