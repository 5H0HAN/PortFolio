"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { FiverrReview } from "@/lib/fiverr";

const AUTO_ADVANCE_DELAY = 5200;

type FiverrReviewCarouselProps = {
  reviews: FiverrReview[];
};

type DragState = {
  startX: number;
  scrollLeft: number;
};

export default function FiverrReviewCarousel({
  reviews,
}: FiverrReviewCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(0);
  const dragRef = useRef<DragState | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(media.matches);

    updatePreference();
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  const scrollToIndex = useCallback(
    (requestedIndex: number) => {
      const track = trackRef.current;
      if (!track || reviews.length === 0) {
        return;
      }

      const index = (requestedIndex + reviews.length) % reviews.length;
      const card = track.querySelector<HTMLElement>(
        `[data-review-index="${index}"]`,
      );

      if (!card) {
        return;
      }

      activeIndexRef.current = index;
      setActiveIndex(index);
      track.scrollTo({
        left: card.offsetLeft - track.offsetLeft,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    },
    [prefersReducedMotion, reviews.length],
  );

  const autoScrollPaused =
    userPaused ||
    prefersReducedMotion ||
    isHovered ||
    isFocusWithin ||
    isDragging;

  useEffect(() => {
    if (autoScrollPaused || reviews.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      scrollToIndex(activeIndexRef.current + 1);
    }, AUTO_ADVANCE_DELAY);

    return () => window.clearInterval(timer);
  }, [autoScrollPaused, reviews.length, scrollToIndex]);

  const syncActiveIndex = () => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const cards = Array.from(
      track.querySelectorAll<HTMLElement>("[data-review-index]"),
    );
    let nearestIndex = activeIndexRef.current;
    let nearestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const distance = Math.abs(
        card.offsetLeft - track.offsetLeft - track.scrollLeft,
      );
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    if (nearestIndex !== activeIndexRef.current) {
      activeIndexRef.current = nearestIndex;
      setActiveIndex(nearestIndex);
    }
  };

  const startMouseDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) {
      return;
    }

    dragRef.current = {
      startX: event.clientX,
      scrollLeft: event.currentTarget.scrollLeft,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const moveMouseDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) {
      return;
    }

    event.preventDefault();
    event.currentTarget.scrollLeft =
      drag.scrollLeft - (event.clientX - drag.startX);
  };

  const finishMouseDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragRef.current = null;
    setIsDragging(false);
    syncActiveIndex();
  };

  return (
    <div
      className="fiverr-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label={`${reviews.length} selected Fiverr reviews`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocusWithin(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsFocusWithin(false);
        }
      }}
    >
      <div className="fiverr-carousel-toolbar">
        <div>
          <span className="fiverr-carousel-label">Latest client feedback</span>
          <span className="fiverr-carousel-count" aria-live="polite">
            {String(activeIndex + 1).padStart(2, "0")} /{" "}
            {String(reviews.length).padStart(2, "0")}
          </span>
        </div>

        <div className="fiverr-carousel-controls">
          <button
            type="button"
            onClick={() => scrollToIndex(activeIndexRef.current - 1)}
            aria-label="Show previous review"
          >
            <span className="flat-arrow is-left" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setUserPaused((current) => !current)}
            aria-pressed={userPaused}
            aria-label={
              userPaused
                ? "Resume automatic review scrolling"
                : "Pause automatic review scrolling"
            }
          >
            {userPaused ? "Play" : "Pause"}
          </button>
          <button
            type="button"
            onClick={() => scrollToIndex(activeIndexRef.current + 1)}
            aria-label="Show next review"
          >
            <span className="flat-arrow" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className={`fiverr-carousel-track ${isDragging ? "is-dragging" : ""}`}
        tabIndex={0}
        onScroll={syncActiveIndex}
        onPointerDown={startMouseDrag}
        onPointerMove={moveMouseDrag}
        onPointerUp={finishMouseDrag}
        onPointerCancel={finishMouseDrag}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            scrollToIndex(activeIndexRef.current - 1);
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            scrollToIndex(activeIndexRef.current + 1);
          }
        }}
        aria-label="Review cards. Swipe, drag or use arrow keys to navigate."
      >
        {reviews.map((review, index) => (
          <article
            className={`fiverr-review-card ${
              index === activeIndex ? "is-active" : ""
            }`}
            key={review.id}
            data-review-index={index}
            role="group"
            aria-label={`Review ${index + 1} of ${reviews.length}`}
          >
            <div className="fiverr-review-meta">
              <span>{review.rating} / 5</span>
              <span>{review.service}</span>
            </div>

            <blockquote>{review.excerpt}</blockquote>

            <div className="fiverr-review-facts">
              <span title={review.country}>{review.countryCode}</span>
              <span>{review.relativeDate}</span>
              <span>{review.duration}</span>
            </div>

            <div className="fiverr-review-client">
              <span className="fiverr-review-avatar" aria-hidden="true">
                {review.username.charAt(0).toUpperCase()}
              </span>
              <span>
                <strong>@{review.username}</strong>
                <small>{review.country}</small>
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="fiverr-carousel-progress" aria-hidden="true">
        <span
          style={{
            transform: `scaleX(${(activeIndex + 1) / reviews.length})`,
          }}
        />
      </div>
    </div>
  );
}
