// components/FollowButton/FollowButton.tsx
import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  ActivityIndicator,
  Animated,
  View 
} from 'react-native';
import { useFollow } from '@/hooks/useFollow'; // 👈 Import manquant
import { useAppSelector } from '@/redux/hooks';
import { selectCurrentUser } from '@/redux/userSlice';// 👈 Import du selector

interface FollowButtonProps {
  targetUserId: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'minimal' | 'outline';
  showCount?: boolean;
  followersCount?: number;
  onFollowChange?: (isFollowing: boolean, newCount: number) => void;
  className?: string;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  targetUserId,
  size = 'medium',
  variant = 'primary',
  showCount = false,
  followersCount = 0,
  onFollowChange,
  className
}) => {
  const { toggleFollow, loading, error, isFollowing } = useFollow(targetUserId);
  
  // 👇 Correction de useAppSelector
  const currentUser = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(state => state.user.isLoggedIn);
  
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const [localFollowersCount, setLocalFollowersCount] = React.useState(followersCount);
  const [localIsFollowing, setLocalIsFollowing] = React.useState(isFollowing);

  // Mettre à jour l'état local quand Redux change
  React.useEffect(() => {
    setLocalIsFollowing(isFollowing);
  }, [isFollowing]);

  React.useEffect(() => {
    setLocalFollowersCount(followersCount);
  }, [followersCount]);

  // Ne pas afficher si non authentifié ou si c'est notre propre profil
  if (!isAuthenticated || currentUser?._id === targetUserId) {
    return null;
  }

  const handlePress = async () => {
    // Animation de feedback
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Optimistic update
    const newFollowingState = !localIsFollowing;
    const newCount = newFollowingState ? localFollowersCount + 1 : Math.max(0, localFollowersCount - 1);
    
    setLocalIsFollowing(newFollowingState);
    setLocalFollowersCount(newCount);
    
    try {
      await toggleFollow(targetUserId);
      onFollowChange?.(newFollowingState, newCount);
    } catch (err) {
      // Revert on error
      setLocalIsFollowing(!newFollowingState);
      setLocalFollowersCount(followersCount);
    }
  };

  // Classes dynamiques pour le bouton
  const getButtonClasses = () => {
    let baseClasses = "rounded-2xl border-2 justify-center items-center min-w-24 shadow-sm";
    
    // Tailles
    if (size === 'small') {
      baseClasses += " px-4 py-2 min-w-20 rounded-xl";
    } else if (size === 'large') {
      baseClasses += " px-8 py-4 min-w-32 rounded-3xl";
    } else {
      baseClasses += " px-6 py-3 min-w-24 rounded-2xl";
    }
    
    // Variantes et états
    if (variant === 'minimal') {
      baseClasses += localIsFollowing 
        ? " bg-transparent border-gray-300" 
        : " bg-transparent border-gray-300";
    } else if (variant === 'outline') {
      baseClasses += localIsFollowing
        ? " bg-transparent border-primary"
        : " bg-transparent border-primary";
    } else {
      baseClasses += localIsFollowing
        ? " bg-white border-gray-200"
        : " bg-primary border-primary";
    }
    
    // États
    if (loading) baseClasses += " opacity-70";
    if (className) baseClasses += ` ${className}`;
    
    return baseClasses;
  };

  // Classes dynamiques pour le texte
  const getTextClasses = () => {
    let baseClasses = "font-semibold tracking-wide";
    
    // Tailles
    if (size === 'small') {
      baseClasses += " text-xs";
    } else if (size === 'large') {
      baseClasses += " text-base";
    } else {
      baseClasses += " text-sm";
    }
    
    // Couleurs selon la variante et l'état
    if (variant === 'minimal') {
      baseClasses += " text-gray-600";
    } else if (variant === 'outline') {
      baseClasses += " text-primary";
    } else {
      baseClasses += localIsFollowing ? " text-gray-700" : " text-white";
    }
    
    return baseClasses;
  };

  const getButtonContent = () => {
    if (loading) {
      return (
        <ActivityIndicator 
          size={size === 'small' ? 'small' : 'small'} 
          color={localIsFollowing ? '#6B7280' : '#FFFFFF'} 
        />
      );
    }

    return (
      <Text className={getTextClasses()}>
        {localIsFollowing ? 'Suivi' : 'Suivre'}
      </Text>
    );
  };

  return (
    <View className="items-center">
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          className={getButtonClasses()}
          onPress={handlePress}
          disabled={loading}
          activeOpacity={0.7}
        >
          {getButtonContent()}
        </TouchableOpacity>
      </Animated.View>

      {showCount && (
        <Text className={
          variant === 'minimal' 
            ? "text-gray-500 text-xs mt-1 font-medium" 
            : "text-gray-500 text-sm mt-1 font-medium"
        }>
          {localFollowersCount.toLocaleString()} abonnés
        </Text>
      )}
      
      {error && (
        <Text className="text-red-600 text-xs mt-1 text-center">
          {error}
        </Text>
      )}
    </View>
  );
};

// Variante avec stats complètes
export const UserFollowStats: React.FC<{
  userId: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  className?: string;
}> = ({ userId, followersCount, followingCount, postsCount, className }) => {
  return (
    <View className={`items-center p-4 ${className || ''}`}>
      <FollowButton 
        targetUserId={userId}
        variant="primary"
        showCount={false}
      />
      
      <View className="flex-row justify-around w-full mt-5">
        <View className="items-center flex-1">
          <Text className="text-gray-900 text-lg font-bold">
            {postsCount.toLocaleString()}
          </Text>
          <Text className="text-gray-500 text-xs mt-1">Publications</Text>
        </View>
        
        <View className="items-center flex-1">
          <Text className="text-gray-900 text-lg font-bold">
            {followersCount.toLocaleString()}
          </Text>
          <Text className="text-gray-500 text-xs mt-1">Abonnés</Text>
        </View>
        
        <View className="items-center flex-1">
          <Text className="text-gray-900 text-lg font-bold">
            {followingCount.toLocaleString()}
          </Text>
          <Text className="text-gray-500 text-xs mt-1">Abonnements</Text>
        </View>
      </View>
    </View>
  );
};

export default FollowButton;