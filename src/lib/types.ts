export type SelectionMethod = "fcfs" | "manual";
export type DeliveryMethod = "pickup" | "courier";
export type ListingStatus = "available" | "locked" | "in_transit" | "delivered";
export type ClaimStatus =
  | "pending"
  | "locked"
  | "paid"
  | "pickup_confirmed"
  | "in_transit"
  | "delivered"
  | "story_shared";

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  karmaPoints: number;
  createdAt: string;
}

export interface Listing {
  id: string;
  donorId: string;
  donorName: string;
  title: string;
  description: string;
  category: string;
  location: string;
  originStory: string;
  photos: string[];
  selectionMethod: SelectionMethod;
  status: ListingStatus;
  lockedClaimId?: string;
  lockedByName?: string;
  deliveryCode: string;
  createdAt: string;
}

export interface Claim {
  id: string;
  listingId: string;
  recipientId: string;
  recipientName: string;
  deliveryMethod: DeliveryMethod;
  fee: number;
  distanceKm: number;
  status: ClaimStatus;
  isChosen: boolean;
  createdAt: string;
}

export interface ThankStory {
  id: string;
  listingId: string;
  listingTitle: string;
  donorName: string;
  recipientName: string;
  note: string;
  photo: string;
  createdAt: string;
}

export const CATEGORIES = [
  "Furniture",
  "Clothes",
  "Kids & Baby",
  "Electronics",
  "Kitchen",
  "Books",
  "Shoes & Bags",
  "Other",
];
