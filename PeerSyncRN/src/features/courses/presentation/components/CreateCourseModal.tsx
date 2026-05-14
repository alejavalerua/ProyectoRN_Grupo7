import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
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
  const [selectedFileUri, setSelectedFileUri] = useState<string | null>(null);
  const [isPickingFile, setIsPickingFile] = useState(false);

  const resetForm = () => {
    setName('');
    setSelectedFileName(null);
    setSelectedFileUri(null);
  };

  const handleDismiss = () => {
    resetForm();
    onDismiss();
  };

  const handleCreate = () => {
    onCreate(name.trim(), selectedFileUri || undefined);
    resetForm();
  };

  const handlePickFile = async () => {
    try {
      setIsPickingFile(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const file = result.assets?.[0];
      if (!file) return;

      setSelectedFileName(file.name ?? 'archivo.csv');
      setSelectedFileUri(file.uri);
    } catch (error) {
      console.error('Error seleccionando archivo CSV:', error);
    } finally {
      setIsPickingFile(false);
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleDismiss}
        contentContainerStyle={[
          styles.modalContainer,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <Text
          variant="titleLarge"
          style={[styles.title, { color: theme.colors.onSurface }]}
        >
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

        <Text
          variant="bodyMedium"
          style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}
        >
          Categoría de Grupo (opc)
        </Text>

        <TouchableOpacity
          style={[
            styles.csvButton,
            {
              borderColor: theme.colors.primary,
              backgroundColor: theme.colors.primaryContainer,
            },
          ]}
          onPress={handlePickFile}
          disabled={isPickingFile}
        >
          <Icon source="plus" size={20} color={theme.colors.primary} />
          <Text style={[styles.csvButtonText, { color: theme.colors.primary }]}>
            {isPickingFile
              ? 'Abriendo archivos...'
              : selectedFileName || 'Importar CSV'}
          </Text>
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <Button mode="outlined" onPress={handleDismiss} style={styles.button}>
            Cancelar
          </Button>
          <Button
            mode="contained"
            onPress={handleCreate}
            style={styles.button}
            disabled={name.trim().length === 0}
          >
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