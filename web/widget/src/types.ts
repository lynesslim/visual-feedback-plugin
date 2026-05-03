export type FeedbackStatus = "open" | "in_progress" | "resolved";
export type FeedbackPriority = "low" | "medium" | "high";
export type CommentAuthorType = "client" | "agency";

export type FeedbackRow = {
  id: string;
  selector: string;
  coordinates: { x: number; y: number };
  comment_text: string;
  image_urls: string[];
  author: string;
  metadata: Record<string, unknown>;
  status: FeedbackStatus;
  priority: FeedbackPriority | null;
  url_path: string;
  created_at: string;
};

export type CommentRow = {
  id: string;
  author_type: CommentAuthorType;
  body: string;
  image_urls: string[];
  created_at: string;
};

export type WidgetConfig = {
  apiBase: string;
  projectSlug: string;
  embedPublicKey: string;
};
