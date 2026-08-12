export interface SiteInfo {
  url: string | null;
  status: string | null;
  notes: string | null;
}

export interface SiteTracking {
  clientId: string;
  siteKey: string;
}

export interface SiteVisit {
  id: string;
  client_id: string;
  path: string | null;
  referrer: string | null;
  visitor_id: string | null;
  created_at: string;
}

export interface SiteStats {
  totalVisits: number;
  uniqueVisitors: number;
  topPaths: { path: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
}
