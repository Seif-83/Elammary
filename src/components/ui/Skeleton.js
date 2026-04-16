import React from 'react';

export const Skeleton = ({ className, width, height, style }) => (
  <div 
    className={`skeleton ${className || ''}`} 
    style={{ width, height, ...style }} 
  />
);

export const SkeletonCard = ({ height = '150px' }) => (
  <div className="card" style={{ height, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Skeleton className="skeleton-circle" />
      <Skeleton width="40%" height="20px" />
    </div>
    <Skeleton className="skeleton-text" />
    <Skeleton className="skeleton-text" width="60%" />
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="table-wrap">
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {[...Array(rows)].map((_, i) => (
        <Skeleton key={i} className="skeleton-row" />
      ))}
    </div>
  </div>
);

export const SkeletonStat = () => (
  <div className="card" style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem' }}>
    <div style={{ flex: 1 }}>
      <Skeleton width="40%" height="15px" style={{ marginBottom: '10px' }} />
      <Skeleton width="70%" height="30px" />
    </div>
    <Skeleton className="skeleton-circle" />
  </div>
);
