import { getFiverrSnapshot } from "@/lib/fiverr";
import FiverrReviewCarousel from "@/components/fiverr-review-carousel";

const formatSnapshotDate = (date: string) =>
  new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));

export default async function FiverrProof() {
  const data = await getFiverrSnapshot();

  return (
    <section className="fiverr-proof" aria-labelledby="fiverr-proof-title">
      <div className="fiverr-proof-glow" aria-hidden="true" />

      <div className="fiverr-proof-header">
        <div>
          <p className="fiverr-proof-kicker">Independent client proof</p>
          <h2 id="fiverr-proof-title">Trusted where the work happens.</h2>
          <p className="fiverr-proof-intro">
            Public feedback from completed Google Workspace, DNS and email
            infrastructure engagements.
          </p>
        </div>

        <a
          className="fiverr-profile-link"
          href={data.profile.profileUrl}
          target="_blank"
          rel="noreferrer"
        >
          View Fiverr profile
          <span className="flat-arrow" aria-hidden="true" />
        </a>
      </div>

      <div className="fiverr-proof-stats" aria-label="Fiverr reputation summary">
        <div className="fiverr-proof-stat">
          <span className="fiverr-proof-stat-value">
            {data.reputation.averageRating.toFixed(1)}
          </span>
          <span>Average rating</span>
          <small>{data.reputation.ratingWindow}</small>
        </div>
        <div className="fiverr-proof-stat">
          <span className="fiverr-proof-stat-value">
            {data.reputation.totalReviews}
          </span>
          <span>Public reviews</span>
          <small>{data.reputation.countWindow}</small>
        </div>
        <div className="fiverr-proof-stat">
          <span className="fiverr-proof-stat-value">
            @{data.profile.username}
          </span>
          <span>{data.profile.sellerLevel}</span>
          <small>Verified profile destination</small>
        </div>
      </div>

      <FiverrReviewCarousel reviews={data.reviews} />

      <div className="fiverr-proof-source">
        <span>
          Managed snapshot updated{" "}
          <time dateTime={data.snapshot.updatedAt}>
            {formatSnapshotDate(data.snapshot.updatedAt)}
          </time>
        </span>
        <span>{data.snapshot.source}. Not a live Fiverr API feed.</span>
      </div>
    </section>
  );
}
