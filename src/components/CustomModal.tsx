import React, { ReactNode } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Text, GestureResponderEvent } from 'react-native';

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm?: (event: GestureResponderEvent) => void;
  confirmText?: string;
  children?: ReactNode;
}

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  onConfirm,
  confirmText = "OK",
  children,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose} // Android back button
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.contentContainer}>{children}</View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <View>
                <Text style={styles.buttonText}>Hủy</Text>
              </View>
            </TouchableOpacity>
            {onConfirm && (
              <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={onConfirm}>
                <View>
                  <Text style={[styles.buttonText, styles.confirmButtonText]}>{confirmText}</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#1e242e',
    borderRadius: 12,
    padding: 20,
  },
  contentContainer: {
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    marginLeft: 10,
  },
  buttonText: {
    fontSize: 16,
    color: '#ffffff',
  },
  confirmButtonText: {
    color: '#ffffff',
  },
});

export default CustomModal;
