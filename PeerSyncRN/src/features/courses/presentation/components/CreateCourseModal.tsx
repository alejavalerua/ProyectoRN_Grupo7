import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Modal, Portal, Text, TextInput, Button, useTheme, Icon } from 'react-native-paper';

interface CreateCourseModalProps {
  visible: boolean;
  onDismiss: () => void;
  onCreate: (name: string, fileUri?: string) => void;
}

export const CreateCourseModal: React.FC<CreateCourseModalProps> = ({
  visible,
  onDismiss,
  onCreate,
}) => {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const handleCreate = () => {
    onCreate(name, selectedFileName || undefined);
    setName('');
    setSelectedFileName(null);
  };

  // Simulación para seleccionar archivo CSV (usarás expo-document-picker en la implementación real)
  const handlePickFile = () => {
    // Aquí iría la lógica de DocumentPicker
    setSelectedFileName('estudiantes_2024.csv'); 
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
        <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
          Crear Curso
        </Text>
        
        <TextInput
          mode="outlined"
          label="Nombre (*)"
          placeholder="Programación Móvil"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
          Categoría de Grupo (opc)
        </Text>

        {/* Botón de importación CSV con estilo de borde punteado */}
        <TouchableOpacity 
          style={[styles.csvButton, { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryContainer }]} 
          onPress={handlePickFile}
        >
          <Icon source="plus" size={20} color={theme.colors.primary} />
          <Text style={[styles.csvButtonText, { color: theme.colors.primary }]}>
            {selectedFileName ? selectedFileName : 'Importar CSV'}
          </Text>
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <Button mode="outlined" onPress={onDismiss} style={styles.button}>
            Cancelar
          </Button>
          <Button mode="contained" onPress={handleCreate} style={styles.button} disabled={name.trim().length === 0}>
            Crear
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
    marginBottom: 16,
  },
  csvButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 24,
  },
  csvButtonText: {
    marginLeft: 8,
    fontWeight: 'bold',
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