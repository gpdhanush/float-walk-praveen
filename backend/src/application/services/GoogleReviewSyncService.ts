import { GoogleBusinessAuthService } from './GoogleBusinessAuthService.js';
import { GoogleBusinessConnectionRepository } from '../../infrastructure/db/repositories/GoogleBusinessConnectionRepository.js';
import { TestimonialRepository } from '../../infrastructure/db/repositories/TestimonialRepository.js';
import { AppError, ErrorCodes } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

export interface GoogleReview {
  reviewId?: string;
  reviewer?: { displayName?: string };
  starRating?: 'STAR_RATING_UNSPECIFIED' | 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE';
  comment?: string;
  createTime?: string;
}

const ratingMap: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

export class GoogleReviewSyncService {
  constructor(
    private readonly auth: GoogleBusinessAuthService,
    private readonly connections: GoogleBusinessConnectionRepository,
    private readonly testimonials: TestimonialRepository,
  ) {}

  async fetchReviews(): Promise<GoogleReview[]> {
    const connection = await this.connections.getActive();
    if (!connection?.google_account_id || !connection.google_location_id) throw new AppError(ErrorCodes.BAD_REQUEST, 'Select a Google Business location before syncing reviews', 400);
    let pageToken: string | undefined;
    const reviews: GoogleReview[] = [];
    do {
      const { token } = await this.auth.getAccessToken();
      const account = connection.google_account_id;
      const location = connection.google_location_id;
      const params = new URLSearchParams({ pageSize: '50', orderBy: 'updateTime desc' });
      if (pageToken) params.set('pageToken', pageToken);
      const response = await fetch(`https://mybusiness.googleapis.com/v4/${account}/locations/${location}/reviews?${params}`,
        { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new AppError(ErrorCodes.INTERNAL_ERROR, `Google reviews request failed (${response.status})`, response.status === 429 ? 429 : 502);
      const data = await response.json() as { reviews?: GoogleReview[]; nextPageToken?: string };
      reviews.push(...(data.reviews ?? []));
      pageToken = data.nextPageToken;
      if (reviews.length > 10000) throw new AppError(ErrorCodes.INTERNAL_ERROR, 'Google returned too many reviews to sync safely', 502);
    } while (pageToken);
    return reviews;
  }

  async sync(): Promise<{ total_fetched: number; created: number; updated: number; skipped: number; failed: number }> {
    const connection = await this.connections.getActive();
    if (!connection?.google_location_id) throw new AppError(ErrorCodes.BAD_REQUEST, 'Google Business location is not selected', 400);
    const reviews = await this.fetchReviews();
    const stats = { total_fetched: reviews.length, created: 0, updated: 0, skipped: 0, failed: 0 };
    for (const review of reviews) {
      const comment = review.comment?.trim();
      const reviewer = review.reviewer?.displayName?.trim() || 'Google customer';
      const rating = review.starRating ? ratingMap[review.starRating] : undefined;
      if (!review.reviewId || !comment || !rating) { stats.skipped++; continue; }
      try {
        const result = await this.testimonials.upsertGoogle({
          google_review_id: review.reviewId,
          google_location_id: connection.google_location_id,
          google_reviewer_name: reviewer,
          customer_name: reviewer,
          rating,
          testimonial: comment,
          review_date: review.createTime ? new Date(review.createTime).toISOString().slice(0, 10) : null,
        });
        stats[result]++;
      } catch (error) {
        stats.failed++;
        logger.error('Google review upsert failed', { reviewId: review.reviewId, error: error instanceof Error ? error.message : 'unknown error' });
      }
    }
    logger.info('Google review sync completed', stats);
    return stats;
  }
}
