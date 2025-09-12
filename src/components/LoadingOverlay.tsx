import React from 'react';
import { ActivityIndicator, Modal, View, Text, StyleSheet } from 'react-native';

type LoadingOverlayProps = {
  visible: boolean;
  text?: string;
  size?: 'small' | 'large' | number;
  color?: string;
  blockTouch?: boolean;
};

/**
 * Fullscreen loading overlay using React Native Modal.
 * - visible: controls visibility
 * - text: optional label under spinner
 * - size/color: forwarded to ActivityIndicator
 * - blockTouch: if false, allows touches to pass through (default true)
 */
const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  text,
  size = 'large',
  color = '#3b82f6',
  blockTouch = true,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      hardwareAccelerated
      presentationStyle="overFullScreen"
    >
      <View pointerEvents={blockTouch ? 'auto' : 'none'} style={styles.backdrop}>
        <View style={styles.card}>
          <ActivityIndicator size={size} color={color} />
          {text ? <Text style={styles.label}>{text}</Text> : null}
        </View>
      </View>
    </Modal>
  );
};

type InlineSpinnerProps = {
  size?: 'small' | 'large' | number;
  color?: string;
  text?: string;
};

/** Inline spinner with optional text, for embedding in layouts */
export const InlineSpinner: React.FC<InlineSpinnerProps> = ({ size = 'small', color = '#3b82f6', text }) => {
  return (
    <View style={styles.inlineRow}>
      <ActivityIndicator size={size} color={color} />
      {text ? <Text style={styles.inlineText}>{text}</Text> : null}
    </View>
  );
};

export default LoadingOverlay;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    minWidth: 140,
    maxWidth: '80%',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 8,
  },
  label: {
    marginTop: 12,
    color: '#111827',
    fontSize: 14,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inlineText: {
    marginLeft: 8,
    color: '#374151',
    fontSize: 14,
  },
});


