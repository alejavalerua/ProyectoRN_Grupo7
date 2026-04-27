import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Modal, Portal, Text, Button, useTheme, Icon } from 'react-native-paper';

interface CreateCategoryModalProps {
  visible: boolean;
  onDismiss: () => void;
  onCreate: (fileUri?: string) => void;
}

export const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  visible,
  onDismiss,
  onCreate,
}) => {
  const theme = useTheme();
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const handlePickFile = () => {
    // Aquí integrarías expo-document-picker
    setSelectedFileName('grupos_clase_a.csv');
  };

  const handleCreate = () => {
    onCreate(selectedFileName || undefined);
    setSelectedFileName(null);
  };

  return (
    <Portal>
      <Modal 
        visible={visible} 
        onDismiss={onDismiss} 
        contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
      >
        <Text variant="titleLarge" style={styles.title}>Crear Categoría Grupo</Text>
        
        <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
          Categoría
        </Text>

        <TouchableOpacity 
          style={[styles.uploadArea, { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryContainer }]} 
          onPress={handlePickFile}
        >
          <Icon source="plus" size={24} color={theme.colors.primary} />
          <Text style={{ color: theme.colors.primary, fontWeight: 'bold', marginLeft: 8 }}>
            {selectedFileName ?? 'Importar CSV'}
          </Text>
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <Button mode="outlined" onPress={onDismiss} style={styles.button}>Cancelar</Button>
          <Button mode="contained" onPress={handleCreate} style={styles.button}>Crear</Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: { margin: 20, padding: 24, borderRadius: 16 },
  title: { fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  label: { marginBottom: 10 },
  uploadArea: {
    height: 50,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  button: { flex: 1, marginHorizontal: 4 },
});