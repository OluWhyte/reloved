import type { Claim, DemoUser, Listing, ThankStory } from "@/lib/types";

// Server-side in-memory store for the REST API (demo mode).
// NOTE: resets on server restart. For persistence, set Supabase env vars
// and swap these helpers for Supabase queries (schema in supabase/schema.sql).
const now = () => new Date().toISOString();

const seedListings: Listing[] = [
  {
    id: "seed_sofa",
    donorId: "seed_donor",
    donorName: "Adaeze O.",
    title: "2-Seater Fabric Sofa — Barely Used",
    description: "Moving out, sofa in great shape. No stains, from a pet-free home.",
    category: "Furniture",
    location: "Lekki Phase 1, Lagos",
    originStory: "Bought this when my daughter was born. Hope it brings another family joy.",
    photos: [],
    selectionMethod: "fcfs",
    status: "available",
    deliveryCode: "482913",
    createdAt: now(),
  },
  {
    id: "seed_books",
    donorId: "seed_donor2",
    donorName: "Tunde B.",
    title: "Box of 30+ Novels & Textbooks",
    description: "Mixed novels and JAMB/WAEC prep texts. Great for a student.",
    category: "Books",
    location: "Yaba, Lagos",
    originStory: "These books got me through university. Time for them to help someone else.",
    photos: [],
    selectionMethod: "manual",
    status: "available",
    deliveryCode: "771204",
    createdAt: now(),
  },
  {
    id: "seed_baby",
    donorId: "seed_donor3",
    donorName: "Mrs. Eze",
    title: "Baby Cot + Stroller Combo",
    description: "Neatly used baby cot and stroller. Cleaned and disinfected.",
    category: "Kids & Baby",
    location: "Ikeja, Lagos",
    originStory: "My twins outgrew these. Reloving them to another mum.",
    photos: [],
    selectionMethod: "manual",
    status: "available",
    deliveryCode: "309155",
    createdAt: now(),
  },
];

type DB = {
  users: DemoUser[];
  listings: Listing[];
  claims: Claim[];
  stories: ThankStory[];
  sessions: Record<string, string>;
};

const g = globalThis as unknown as { __reloved_db?: DB };

export function db(): DB {
  if (!g.__reloved_db) {
    g.__reloved_db = {
      users: [],
      listings: [...seedListings],
      claims: [],
      stories: [
        {
          id: "story_1",
          listingId: "seed_sofa",
          listingTitle: "Study Desk for Final Year",
          donorName: "Chiamaka",
          recipientName: "Ibrahim",
          note: "This desk is where I will finish my final year project. Thank you!",
          photo: "",
          createdAt: now(),
        },
      ],
      sessions: {},
    };
  }
  return g.__reloved_db;
}

export function publicUser(u: DemoUser) {
  const rest: Omit<DemoUser, "password"> = {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    karmaPoints: u.karmaPoints,
    createdAt: u.createdAt,
  };
  return rest;
}
