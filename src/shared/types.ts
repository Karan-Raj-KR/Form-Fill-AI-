// ─── Field Categories ───
export type FieldCategory =
  | 'personal'
  | 'contact'
  | 'address'
  | 'professional'
  | 'education'
  | 'essay'
  | 'project'
  | 'social'
  | 'payment'
  | 'credential'
  | 'other';

// ─── Preferences ───
export type TonePreference = 'formal' | 'casual' | 'bold' | 'professional';
export type LengthPreference = 'concise' | 'moderate' | 'detailed';
export type AIProvider = 'openai' | 'anthropic' | 'gemini' | 'groq';
export type Page = 'dashboard' | 'home' | 'preview' | 'profiles' | 'settings' | 'history' | 'paymentVault' | 'passwordVault';

export interface DetectedField {
  id: string;
  fieldId?: string;
  selector: string;
  fallbackSelector?: string;
  tagName: string;
  type: string; // 'text'|'email'|'tel'|'password'|'textarea'|'select'|'radio'|'checkbox'|'checkbox-group'|'date'|'time'|'number'|…
  label: string;
  placeholder: string;
  name: string;
  ariaLabel: string;
  currentValue: string;
  suggestedValue: string;
  confidence: number;
  category: FieldCategory;
  status: 'pending' | 'generating' | 'ready' | 'filled' | 'skipped' | 'error';
  options?: string[];
}

// ─── Profile ───
export interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  company: string;
  role: string;
  website: string;
  linkedin: string;
  github: string;
  twitter: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  skills: string;
  education: string;
  experience: string;
  projects: string;
  rawInfo: string;
  customFields: Record<string, string>;
}

export interface Profile {
  id: string;
  name: string;
  color: string;
  emoji: string;
  data: ProfileData;
  tonePreference: TonePreference;
  lengthPreference: LengthPreference;
  createdAt: number;
  updatedAt: number;
}

// ─── Settings ───
export interface Settings {
  aiProvider: AIProvider;
  openaiApiKey: string;
  anthropicApiKey: string;
  geminiApiKey: string;
  groqApiKey: string;
  openaiModel: string;
  anthropicModel: string;
  geminiModel: string;
  groqModel: string;
  defaultTone: TonePreference;
  defaultLength: LengthPreference;
  activeProfileId: string;
  autoDetect: boolean;
  showConfidence: boolean;
}

// ─── History ───
export interface FillHistoryEntry {
  id: string;
  domain: string;
  url: string;
  title: string;
  profileId: string;
  profileName: string;
  fieldCount: number;
  filledCount: number;
  fields: Array<{ label: string; value: string; category: FieldCategory }>;
  timestamp: number;
}

// ─── Payment Card ───
export interface PaymentCard {
  id: string;
  nickname: string;
  cardholderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  billingAddress?: string;
  billingCity?: string;
  billingZip?: string;
  billingCountry?: string;
  isDefault: boolean;
  createdAt: number;
}

// ─── Password Entry ───
export interface PasswordEntry {
  id: string;
  domain: string;
  username: string;
  password: string;
  label?: string;
  createdAt: number;
  updatedAt: number;
}

// ─── Messages between popup / content / background ───
export interface ScanFieldsMessage {
  type: 'SCAN_FIELDS';
}

export interface ScanFieldsResponse {
  fields: DetectedField[];
}

export interface FillFieldMessage {
  type: 'FILL_FIELD';
  fieldId?: string;
  selector: string;
  fallbackSelector?: string;
  value: string;
  tagName: string;
}

export interface FillAllMessage {
  type: 'FILL_ALL';
  fields: Array<{ selector: string; value: string; tagName: string }>;
}

export interface GenerateFillsMessage {
  type: 'GENERATE_FILLS';
  payload: {
    fields: DetectedField[];
    profile: Profile;
    settings: Settings;
  };
}

export interface GenerateFillsResponse {
  suggestions: Array<{
    index: number;
    value: string;
    confidence: number;
  }>;
  error?: string;
}

export interface HighlightFieldsMessage {
  type: 'HIGHLIGHT_FIELDS';
  selectors: string[];
}

export interface ClearHighlightsMessage {
  type: 'CLEAR_HIGHLIGHTS';
}
