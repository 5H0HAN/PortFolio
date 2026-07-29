import snapshotData from "@/content/fiverr-reviews.json";

export type FiverrReview = {
  id: string;
  username: string;
  countryCode: string;
  country: string;
  relativeDate: string;
  rating: number;
  excerpt: string;
  service: string;
  price: string;
  duration: string;
};

export type FiverrSnapshot = {
  profile: {
    displayName: string;
    username: string;
    profileUrl: string;
    sellerLevel: string;
  };
  reputation: {
    averageRating: number;
    totalReviews: number;
    ratingWindow: string;
    countWindow: string;
  };
  snapshot: {
    updatedAt: string;
    source: string;
    isLive: boolean;
  };
  reviews: FiverrReview[];
};

export interface FiverrProvider {
  getSnapshot(): Promise<FiverrSnapshot>;
}

class LocalFiverrSnapshotProvider implements FiverrProvider {
  async getSnapshot() {
    return snapshotData as FiverrSnapshot;
  }
}

const fiverrProvider: FiverrProvider = new LocalFiverrSnapshotProvider();

export async function getFiverrSnapshot() {
  return fiverrProvider.getSnapshot();
}
