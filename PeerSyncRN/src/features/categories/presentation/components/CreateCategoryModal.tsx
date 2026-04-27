import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Modal, Portal, Text, Button, useTheme, Icon } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';

interface CreateCategoryModalProps {
  visible: boolean;
  onDismiss: () => void;
  // Ahora pasamos el archivo seleccionado de vuelta a la pantalla
  onCreate: (file?: DocumentPicker.DocumentPickerAsset) => void;
}

export const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  visible,
  onDismiss,
  onCreate,
}) => {
  const theme = useTheme();
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        // Limitamos a archivos CSV
        type: ['text/csv', 'text/comma-separated-values', 'application/csv'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error) {
      console.error("Error al seleccionar archivo:", error);
    }
  };

  const handleCreate = () => {
    onCreate(selectedFile || undefined);
    setSelectedFile(null); // Limpiamos para la próxima vez
  };

  const handleDismiss = () => {
    setSelectedFile(null); // Limpiamos si el usuario cancela
    onDismiss();
  };

  return (
    <Portal>
      <Modal 
        visible={visible} 
        onDismiss={handleDismiss} 
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
          <Icon source="file-document-outline" size={24} color={theme.colors.primary} />
          <Text 
            style={{ color: theme.colors.primary, fontWeight: 'bold', marginLeft: 8, flex: 1 }} 
            numberOfLines={1}
          >
            {selectedFile ? selectedFile.name : 'Importar CSV'}
          </Text>
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <Button mode="outlined" onPress={handleDismiss} style={styles.button}>Cancelar</Button>
          <Button 
            mode="contained" 
            onPress={handleCreate} 
            style={styles.button} 
            disabled={!selectedFile} // Deshabilitado hasta que seleccione un archivo
          >
            Crear
          </Button>
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
    paddingHorizontal: 10,
  },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  button: { flex: 1, marginHorizontal: 4 },
}); 