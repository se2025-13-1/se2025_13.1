import React, {useState} from 'react';
import {TouchableOpacity, Image, StyleSheet} from 'react-native';
import {useAuth} from '../../../contexts/AuthContext';
import {wishlistApi} from '../services/wishlistApi';

interface LoveButtonProps {
  productId: string;
  initialIsLiked?: boolean;
  onToggle?: (isLiked: boolean) => void;
}

const LoveButton: React.FC<LoveButtonProps> = ({
  productId,
  initialIsLiked = false,
  onToggle,
}) => {
  const {isAuthenticated} = useAuth();
  const [isFavorited, setIsFavorited] = useState(initialIsLiked);
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {
    if (!isAuthenticated) {
      console.warn('⚠️ User is not authenticated');
      return;
    }

    setIsLoading(true);
    try {
      const response = await wishlistApi.toggleWishlist(productId);
      setIsFavorited(response.is_liked);
      onToggle?.(response.is_liked);
      console.log(
        '✅ Wishlist toggled successfully, is_liked:',
        response.is_liked,
      );
    } catch (error) {
      console.error('❌ Error toggling wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      disabled={isLoading}
      activeOpacity={0.7}>
      <Image
        source={
          isFavorited
            ? require('../../../assets/icons/HeartFilled.png')
            : require('../../../assets/icons/Heart.png')
        }
        style={styles.icon}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  icon: {
    width: 20,
    height: 20,
  },
});

export default LoveButton;
