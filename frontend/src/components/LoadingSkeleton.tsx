import React from 'react';
import { Skeleton } from './ui/skeleton';
import { cn } from '../lib/utils';

const Pulse = ({ className }: { className: string }) => <Skeleton className={className} />;

export const DirectorySkeleton: React.FC = () => (
  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3" aria-label="Loading student directory">
    {Array.from({ length: 6 }, (_, index) => (
      <div key={index} className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <Pulse className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Pulse className="h-3.5 w-2/3" />
            <Pulse className="h-3 w-1/2" />
          </div>
          <Pulse className="h-8 w-14 rounded-md" />
        </div>
        <Pulse className="mt-4 h-3 w-11/12" />
        <Pulse className="mt-2 h-3 w-4/5" />
        <div className="mt-4 flex gap-2">
          <Pulse className="h-5 w-16 rounded-full" />
          <Pulse className="h-5 w-14 rounded-full" />
          <Pulse className="h-5 w-12 rounded-full" />
        </div>
        <div className="mt-4 flex justify-between border-t border-border pt-4">
          <Pulse className="h-4 w-20" />
          <Pulse className="h-4 w-24" />
        </div>
      </div>
    ))}
  </div>
);

export const RequestSkeleton: React.FC = () => (
  <div className="space-y-3" aria-label="Loading exchange requests">
    {Array.from({ length: 3 }, (_, index) => (
      <div key={index} className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="flex justify-between">
          <div className="flex items-center gap-3">
            <Pulse className="h-9 w-9 rounded-full" />
            <div className="space-y-2">
              <Pulse className="h-3.5 w-36" />
              <Pulse className="h-3 w-48" />
            </div>
          </div>
          <Pulse className="h-5 w-16 rounded-full" />
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Pulse className="h-20 rounded-lg" />
          <Pulse className="h-20 rounded-lg" />
        </div>
        <Pulse className="mt-4 h-8 w-full" />
      </div>
    ))}
  </div>
);

export const ProfileSkeleton: React.FC = () => (
  <div className="space-y-6" aria-label="Loading student profile">
    <div className="space-y-3 border-b border-border pb-6">
      <Pulse className="h-8 w-52" />
      <Pulse className="h-4 w-72" />
    </div>
    <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <div className="space-y-4">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6" aria-label="Loading dashboard">
    <div className="border-b border-border pb-6">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-3 h-8 w-48" />
      <Skeleton className="mt-2 h-4 w-64" />
    </div>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} className="h-28 rounded-xl border border-border bg-card" />
      ))}
    </div>
    <Skeleton className="h-64 rounded-xl border border-border bg-card" />
  </div>
);

export const ExchangesSkeleton: React.FC = () => (
  <div className="space-y-6" aria-label="Loading exchanges">
    <div className="border-b border-border pb-6">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-3 h-8 w-56" />
      <Skeleton className="mt-2 h-4 w-72" />
    </div>
    <Skeleton className="h-10 w-full rounded-lg sm:w-64" />
    <RequestSkeleton />
  </div>
);

export const AdminSkeleton: React.FC<{ inline?: boolean }> = ({ inline = false }) => (
  <div className={cn('space-y-4', !inline && 'space-y-6')} aria-label="Loading administrator data">
    {!inline && (
      <>
        <div className="border-b border-border pb-6">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-24 rounded-xl border border-border bg-card" />
          ))}
        </div>
      </>
    )}
    <div className="space-y-2">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} className="h-12 rounded-md" />
      ))}
    </div>
  </div>
);
