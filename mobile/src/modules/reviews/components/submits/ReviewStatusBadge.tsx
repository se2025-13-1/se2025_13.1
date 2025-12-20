import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface ReviewStatusBadgeProps {
  isReviewed: boolean;
  isApproved?: boolean; // Cho tương lai nếu cần hiển thị trạng thái duyệt
}

export const ReviewStatusBadge: React.FC<ReviewStatusBadgeProps> = ({
  isReviewed,
  isApproved = true,
}) => {
  // Quyết định hiển thị badge nào
  const getBadgeConfig = () => {
    if (isReviewed) {
      if (isApproved) {
        return {
          text: '✅ Đã đánh giá',
          color: '#4CAF50',
          backgroundColor: '#E8F5E8',
        };
      } else {
        return {
          text: '⏳ Đang duyệt',
          color: '#FF9800',
          backgroundColor: '#FFF3E0',
        };
      }
    } else {
      return {
        text: '⭕ Chưa đánh giá',
        color: '#2196F3',
        backgroundColor: '#E3F2FD',
      };
    }
  };

  const config = getBadgeConfig();

  return (
    <View style={[styles.badge, {backgroundColor: config.backgroundColor}]}>
      <Text style={[styles.badgeText, {color: config.color}]}>
        {config.text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
