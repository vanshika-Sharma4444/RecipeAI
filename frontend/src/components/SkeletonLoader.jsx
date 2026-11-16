import React from 'react';
import './SkeletonLoader.css';

export const RecipeCardSkeleton = () => (
  <div className="skeleton-card">
    <div className="skeleton-image skeleton-pulse" />
    <div className="skeleton-content">
      <div className="skeleton-line skeleton-title skeleton-pulse" />
      <div className="skeleton-line skeleton-desc skeleton-pulse" />
      <div className="skeleton-line skeleton-desc-short skeleton-pulse" />
      <div className="skeleton-meta">
        <div className="skeleton-badge skeleton-pulse" />
        <div className="skeleton-badge skeleton-pulse" />
        <div className="skeleton-badge skeleton-pulse" />
      </div>
      <div className="skeleton-btn skeleton-pulse" />
    </div>
  </div>
);

export const RecipeGridSkeleton = ({ count = 6 }) => (
  <div className="skeleton-grid">
    {Array.from({ length: count }).map((_, i) => (
      <RecipeCardSkeleton key={i} />
    ))}
  </div>
);

export default RecipeCardSkeleton;

