export interface Offer {
  id: string;
  code: 'FIRST_FREE' | 'VIDEO' | 'ASSISTED' | string;
  title: string;
  description: string;
  durationMin: number;
  priceCents: number;
  currency: string;
  isFree: boolean;
  mode: string;
  requiresSlot: boolean;
  features: string[] | null;
}

export interface ProgramSession {
  id: string;
  startDate: string;
  endDate: string;
  capacity: number;
  seatsLeft?: number;
}

export interface Program {
  id: string;
  slug: string;
  kind: 'INITIATION' | 'TOUR' | 'RETREAT';
  title: string;
  subtitle: string | null;
  description: string;
  durationDays: number;
  priceCents: number;
  currency: string;
  coverUrl: string | null;
  gallery: string[] | null;
  itinerary: { day: number; title: string; text: string }[] | null;
  includes: string[] | null;
  sessions: ProgramSession[];
}

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
  coverUrl: string | null;
  priceCents: number;
  currency: string;
  capacity: number;
  seatsLeft: number;
}

export interface ArticleBrief {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string | null;
  category: string;
  publishedAt: string | null;
}

export interface Article extends ArticleBrief {
  body: string;
}

export interface OduTeaching {
  slug: string;
  essence: string;
  teaching: string | null;
  keywords: string[];
}

// ---------- Phase 5 : consultations ----------
export type ConsultationStatus = 'REQUESTED' | 'AWAITING_PAYMENT' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type EboStatus = 'PROPOSED' | 'ACCEPTED' | 'DECLINED' | 'PAID' | 'PERFORMED';

export interface Slot { id: string; startsAt: string; endsAt: string; isBooked?: boolean }

export interface Report {
  id: string;
  oduId: number;
  orientation: 'IRE' | 'IBI';
  oriDetail: string | null;
  ese: string;
  message: string;
  actionPlan: string[];
  ewo: string[];
  privateNotes: string | null;
  publishedAt: string | null;
  updatedAt: string;
}

export interface EboItem { label: string; qty: number; unitCents: number }

export interface Ebo {
  id: string;
  consultationId: string;
  title: string;
  purpose: string;
  items: EboItem[];
  materialsCents: number;
  priestFeeCents: number;
  currency: string;
  status: EboStatus;
  liveAllowed: boolean;
  proofVideoUrl: string | null;
  performedAt: string | null;
  createdAt: string;
}

export interface FollowUp {
  id: string;
  consultationId: string;
  dayOffset: number;
  dueAt: string;
  answeredAt: string | null;
  progress: number | null;
  note: string | null;
  priestReply: string | null;
}

export interface Consultation {
  id: string;
  status: ConsultationStatus;
  question: string;
  context: string | null;
  readingId: string | null;
  roomUrl: string | null;
  priceCents: number;
  currency: string;
  isFirstFree: boolean;
  createdAt: string;
  offer: Offer;
  slot: Slot | null;
  report: Report | null;
  ebos: Ebo[];
  followUps: FollowUp[];
  user?: { id: string; firstName: string; lastName: string | null; email: string; country: string | null };
}

export interface Ewo { id: string; text: string; source: string | null; createdAt: string }

export interface Dossier {
  consultations: Consultation[];
  ewos: Ewo[];
  readings: { id: string; oduId: number; sunSign: string; createdAt: string }[];
}
