export interface Phrase {
  phrase_numbers: number;
  hawaiian_phrase: string;
  english_phrase: string | null;
  meaning_phrase: string | null;
  headword_link: string | null;
  source_link: string | null;
  hawaiian_letter: string | null;
  headword_label: string | null;
  category: string | null;
  tags: string[];
}

export interface Favorite {
  user_id: string;
  phrase_numbers: number;
  created_at?: string;
}

export interface Visitor {
  ip_hash: string;
  last_seen: string;
}

export interface Submission {
  id?: string;
  hawaiian_phrase: string;
  english_phrase?: string;
  meaning_phrase?: string;
  submitted_by?: string;
  email?: string | null;
  can_share_publicly?: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
}

export interface Whiteboard {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface WhiteboardNote {
  id: string;
  whiteboard_id: string;
  content: string;
  x: number;
  y: number;
  phrase_numbers?: number | null;
  created_at: string;
  updated_at: string;
}
