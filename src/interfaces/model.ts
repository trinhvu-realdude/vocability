// ─── Domain Models (Supabase-backed) ───────────────────────────────────────

export type ShareRole = 'viewer' | 'editor' | 'owner';

export interface CollectionShare {
    id?: string;
    collection_id: string;
    user_id: string;
    role: ShareRole;
    created_at?: string;
    updated_at?: string;
    // Joined from profiles
    profile?: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'>;
}

export interface Collection {
    id?: string;          // uuid
    user_id?: string;     // uuid — set by service from auth.uid()
    name: string;
    color: string;
    num_of_words?: number; // computed or joined from words table
    language_id: number;
    created_at?: string;
    updated_at?: string;
    shares?: CollectionShare[]; // populated when fetching with shares
    myRole?: ShareRole | 'owner'; // effective role for the current user
    owner_profile?: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'>; // profile of the owner
}

export interface Word {
    id?: string;          // uuid
    user_id?: string;     // uuid
    collection_id?: string; // uuid FK → collections.id
    word: string;
    phonetic?: string;
    definitions: Definition[];  // fetched/joined from definitions table
    part_of_speech: string;
    is_favorite: boolean;
    ease_factor?: number;       // SM-2 default: 2.5
    interval?: number;          // days until next review
    repetitions?: number;       // successful review count
    next_review_date?: string;  // ISO string
    created_at?: string;
    updated_at?: string;
}

export interface Definition {
    id?: string;         // uuid (optional, used when persisting)
    word_id?: string;    // uuid FK → words.id
    definition: string;
    notes: string;
    sort_order?: number;
}

export interface WordDto extends Word {
    collection: Collection;
}

export interface Profile {
    id: string; // uuid from auth.users
    email: string;
    username: string;
    display_name: string;
    avatar_url: string;
    created_at?: string;
    updated_at?: string;
}

export type QuestionVocabularyQuiz = {
    id: string;
    question: string;
    answers: [
        {
            id: string;
            option: string;
            isCorrect: boolean;
        }
    ];
};
