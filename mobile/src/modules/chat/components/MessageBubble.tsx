import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ViewStyle,
  ImageStyle,
  TextStyle,
} from 'react-native';

interface MessageBubbleProps {
  text?: string;
  image?: string;
  sender: 'user' | 'other';
  timestamp?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  text,
  image,
  sender,
  timestamp,
}) => {
  const isUserBubble = sender === 'user';

  // Container style dựa trên sender
  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    marginVertical: 8,
    paddingHorizontal: 12,
    justifyContent: isUserBubble ? 'flex-end' : 'flex-start',
  };

  // Bubble style dựa trên sender
  const bubbleStyle: ViewStyle = {
    maxWidth: Dimensions.get('window').width * 0.75,
    padding: 12,
    borderRadius: 12,
    backgroundColor: isUserBubble ? '#007AFF' : '#E8E8E8',
  };

  // Text style dựa trên sender
  const textStyle: TextStyle = {
    color: isUserBubble ? '#FFFFFF' : '#000000',
    fontSize: 14,
    lineHeight: 20,
  };

  // Timestamp style
  const timestampStyle: TextStyle = {
    color: isUserBubble ? '#FFFFFF' : '#999999',
    fontSize: 12,
    marginTop: 4,
  };

  return (
    <View style={containerStyle}>
      <View style={bubbleStyle}>
        {/* Text content */}
        {text && <Text style={textStyle}>{text}</Text>}

        {/* Image content */}
        {image && (
          <View style={{marginBottom: text ? 8 : 0}}>
            <Image source={{uri: image}} style={styles.image} />
          </View>
        )}

        {/* Timestamp */}
        {timestamp && <Text style={timestampStyle}>{timestamp}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: Dimensions.get('window').width * 0.6,
    height: 200,
    borderRadius: 8,
  },
});

export default MessageBubble;
