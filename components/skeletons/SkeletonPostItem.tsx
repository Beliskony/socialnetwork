import React from 'react';
import { View } from 'react-native';

const Skeleton = ({ className }: { className?: string }) => (
  <View className={`bg-gray-300 dark:bg-gray-700 animate-pulse ${className}`} />
);

const PostSkeleton = () => {
  return (
    <View className="my-3 bg-white dark:bg-black rounded-xl overflow-hidden">
      
      {/* Header */}
      <View className="flex-row items-center p-4 space-x-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <View className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="h-3 w-24 rounded-md" />
        </View>
      </View>

      {/* Text */}
      <View className="px-4 space-y-2 mb-3">
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-4/5 rounded-md" />
      </View>

      {/* Media */}
      <Skeleton className="w-full h-64" />

      {/* Actions */}
      <View className="flex-row justify-between px-4 py-3">
        <View className="flex-row gap-5">
          <Skeleton className="h-6 w-6 rounded-md" />
          <Skeleton className="h-6 w-6 rounded-md" />
          <Skeleton className="h-6 w-6 rounded-md" />
        </View>
        <Skeleton className="h-6 w-6 rounded-md" />
      </View>
    </View>
  );
};

export default PostSkeleton;
