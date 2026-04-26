import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, Text, TextInput, Button, useTheme } from 'react-native-paper';

interface AddCourseModalProps {
  visible: boolean;
  onDismiss: () => void;
  onAdd: (code: string) => void;
  title?: string;
}

export const AddCourseModal: React.FC<AddCourseModalProps> = ({
  visible,
  onDismiss,
  onAdd,
  title = 'Agregar Curso',
}) => {
  const theme = useTheme();
  const [code, setCode] = useState('');

  const handleAdd = () => {
    onAdd(code);
    setCode(''); // Limpiar al enviar
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
        <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
          {title}
        </Text>
        
        <TextInput
          mode="outlined"
          label="Código del curso"
          placeholder="Ej: 45678901"
          value={code}
          onChangeText={setCode}
          maxLength={11}
          keyboardType="numeric"
          style={styles.input}
        />

        <View style={styles.buttonRow}>
          <Button mode="outlined" onPress={onDismiss} style={styles.button}>
            Cancelar
          </Button>
          <Button mode="contained" onPress={handleAdd} style={styles.button} disabled={code.trim().length === 0}>
            Agregar
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    margin: 20,
    padding: 24,
    borderRadius: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});