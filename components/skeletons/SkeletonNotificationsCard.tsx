// components/notifications/NotificationCardSkeleton.tsx
import { View } from "react-native"

export default function NotificationCardSkeleton() {
  return (
    <View className="bg-white dark:bg-black w-full rounded-xl p-4 mb-3 border-l-4 border-slate-200 dark:border-slate-700">

      {/* Header */}
      <View className="flex-row items-start">
        {/* Avatar */}
        <View className="relative">
          <View className="w-12 h-12 rounded-full bg-slate-300 dark:bg-slate-700" />
          {/* Badge */}
          <View className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-600 absolute top-0 right-0" />
        </View>

        <View className="ml-3 flex-1">
          {/* Username */}
          <View className="w-32 h-4 rounded-full bg-slate-300 dark:bg-slate-700 mb-2" />
          
          {/* Notification message */}
          <View className="w-48 h-3 rounded-full bg-slate-200 dark:bg-slate-600 mb-2" />
          
          {/* Notification content preview */}
          <View className="w-40 h-3 rounded-full bg-slate-200 dark:bg-slate-600 mb-1" />
          
          {/* Post content preview */}
          <View className="w-36 h-3 rounded-full bg-slate-200 dark:bg-slate-600 mb-2" />
          
          {/* Time */}
          <View className="w-20 h-3 rounded-full bg-slate-200 dark:bg-slate-600" />
        </View>

        {/* Post icon */}
        <View className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700" />
      </View>

    </View>
  )
}