'use client';

import React from 'react';

export default function InstagramSkeletonLoader() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
