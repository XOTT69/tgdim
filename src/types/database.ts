export type IssueCategory = "lighting" | "water" | "waste" | "cleaning" | "doors_intercom" | "parking_territory" | "yard_common_area" | "other";
export type IssueStatus = "new" | "in_progress" | "resolved";
export type FoundLostType = "lost" | "found";
export type HelpPostType = "need_help" | "can_help";
export type ModerationContentType = "found_lost" | "help_post" | "master_recommendation";

type Timestamps = { created_at: string; updated_at: string };

export type Profile = Timestamps & {
  id: string;
  telegram_id: number;
  first_name: string;
  last_name: string | null;
  username: string | null;
  photo_url: string | null;
  entrance: string | null;
  apartment: string | null;
  notifications_enabled: boolean;
  is_admin: boolean;
};

export type Announcement = Timestamps & { id: string; title: string; body: string; image_path: string | null; published_at: string; expires_at: string | null; author_id: string };
export type BuildingIssue = Timestamps & { id: string; category: IssueCategory; location: string; description: string; image_path: string | null; status: IssueStatus; reporter_id: string; resolved_at: string | null };
export type Poll = Timestamps & { id: string; question: string; closes_at: string | null; is_closed: boolean; author_id: string };
export type PollOption = { id: string; poll_id: string; label: string; position: number };
export type PollVote = { id: string; poll_id: string; option_id: string; voter_id: string; created_at: string };
export type FoundLostPost = Timestamps & { id: string; type: FoundLostType; title: string; description: string; location: string; occurred_on: string; image_path: string | null; contact_method: string; author_id: string };
export type Master = Timestamps & { id: string; category: string; name: string; description: string | null; contact_details: string | null; created_by: string };
export type MasterRecommendation = Timestamps & { id: string; master_id: string; author_id: string; rating: number; comment: string | null; contact_details: string | null };
export type HelpPost = Timestamps & { id: string; type: HelpPostType; title: string; description: string; location: string | null; contact_details: string | null; author_id: string };
export type BuildingEvent = Timestamps & { id: string; title: string; description: string; starts_at: string; location: string; organizer_id: string };
export type EventAttendee = { event_id: string; user_id: string; created_at: string };
export type ModerationRecord = { content_type: ModerationContentType; content_id: string; is_hidden: boolean; reason: string | null; moderator_id: string; updated_at: string };
