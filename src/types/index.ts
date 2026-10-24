import type { UserRole, UserStatus, ListingStatus, ReportStatus, ReportReason, ReportTargetType, GuideCategory, OpportunityCategory, PublicationStatus } from "@/models";

export interface CategoryDTO {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  description: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
}

export interface ListingContactDTO {
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
}

export interface ListingImageDTO {
  url: string;
  alt?: string;
}

export interface ListingHourDTO {
  day: number;
  opensAt: string;
  closesAt: string;
}

export interface ListingServiceItemDTO {
  name: string;
  price?: number | null;
  description?: string;
}

export interface ListingSummaryDTO {
  id: string;
  name: string;
  slug: string;
  excerpt: string;
  category: { id: string; slug: string; name: string; icon: string } | null;
  location: { division: string; district: string; upazila?: string };
  thumbnail: string | null;
  status: ListingStatus;
  verified: boolean;
  featured: boolean;
  rating: { average: number; count: number };
  createdAt: string;
}

export interface ListingDetailDTO extends ListingSummaryDTO {
  description: string;
  ownerName: string;
  contact: ListingContactDTO;
  addressLine?: string;
  images: ListingImageDTO[];
  openingHours: ListingHourDTO[];
  services: ListingServiceItemDTO[];
  stats: { views: number; contactClicks: number };
  statusReason?: string;
}

export interface ReviewDTO {
  id: string;
  rating: number;
  comment?: string;
  userName: string;
  createdAt: string;
}

export interface GuideDTO {
  id: string;
  title: string;
  slug: string;
  category: GuideCategory;
  description: string;
  lastReviewedAt: string;
}

export interface GuideDetailDTO extends GuideDTO {
  steps: { title: string; body: string }[];
  requiredDocuments: string[];
  sourceLinks: { label: string; url: string }[];
}

export interface OpportunityDTO {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: OpportunityCategory;
  organization?: string;
  sourceLabel: string;
  sourceUrl: string;
  deadline: string | null;
  isDemo: boolean;
  isExpired: boolean;
}

export interface ReportDTO {
  id: string;
  targetType: ReportTargetType;
  reason: ReportReason;
  details?: string;
  status: ReportStatus;
  createdAt: string;
  targetLabel?: string;
  resolutionNote?: string;
}

export interface UserAdminDTO {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface AdminListingRowDTO {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  categoryName: string;
  district: string;
  status: ListingStatus;
  featured: boolean;
  verified: boolean;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export type { UserRole, UserStatus, ListingStatus, ReportStatus, ReportReason, ReportTargetType, GuideCategory, OpportunityCategory, PublicationStatus };
export type { ServiceSearchParams } from "@/lib/validations/listing";
