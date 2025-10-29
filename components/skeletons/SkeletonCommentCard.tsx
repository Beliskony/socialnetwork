// components/Comments/CommentCardSkeleton.tsx
import { View } from "react-native"
import React from "react-native"

export default function CommentCardSkeleton() {
  return (
    <View className="bg-white dark:bg-black border border-slate-200 dark:border-gray-600 rounded-xl p-4 mb-3">

      {/* Header */}
      <View className="flex-row items-start mb-3">
        {/* Avatar */}
        <View className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700" />

        <View className="ml-3 flex-1">
          <View className="w-28 h-3 rounded-full bg-slate-300 dark:bg-slate-700 mb-2" />
          <View className="w-20 h-2 rounded-full bg-slate-200 dark:bg-slate-600" />
        </View>
      </View>

      {/* Content lines */}
      <View className="space-y-2 mb-4">
        <View className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full" />
        <View className="w-3/4 h-3 bg-slate-200 dark:bg-slate-700 rounded-full" />
      </View>

      {/* Bottom Actions */}
      <View className="flex-row justify-between mt-2">
        <View className="w-10 h-3 bg-slate-300 dark:bg-slate-700 rounded-full" />
        <View className="w-14 h-3 bg-slate-300 dark:bg-slate-700 rounded-full" />
        <View className="w-20 h-3 bg-slate-300 dark:bg-slate-700 rounded-full" />
      </View>
    </View>
  )
}
