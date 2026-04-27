import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal, Portal, Text, TextInput, Button, Switch, useTheme } from 'react-native-paper';

interface CreateActivityModalProps {
  visible: boolean;
  onDismiss: () => void;
  onCreate: (data: any) => void;
}

export const CreateActivityModal: React.FC<CreateActivityModalProps> = ({ visible, onDismiss, onCreate }) => {
  const theme = useTheme();
  const [isPublic, setIsPublic] = useState(false);
  const [name, setName] = useState('');

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text variant="titleLarge" style={styles.title}>Crear Actividad</Text>

          <TextInput mode="outlined" label="Nombre (*)" placeholder="Taller 1" value={name} onChangeText={setName} style={styles.input} />
          
          <View style={styles.row}>
            <TextInput mode="outlined" label="Fecha Inicio" placeholder="DD/MM/YY" style={styles.flexInput} right={<TextInput.Icon icon="calendar" />} />
            <View style={{ width: 10 }} />
            <TextInput mode="outlined" label="Fecha Fin" placeholder="DD/MM/YY" style={styles.flexInput} right={<TextInput.Icon icon="calendar" />} />
          </View>

          <View style={[styles.row, { alignItems: 'center', justifyContent: 'center', marginVertical: 15 }]}>
            <Text>Público</Text>
            <Switch value={isPublic} onValueChange={setIsPublic} color={theme.colors.primary} />
          </View>

          <View style={styles.buttonRow}>
            <Button mode="outlined" onPress={onDismiss} style={styles.button}>Cancelar</Button>
            <Button mode="contained" onPress={() => onCreate({ name, isPublic })} style={styles.button}>Crear</Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: { margin: 20, padding: 24, borderRadius: 16, maxHeight: '80%' },
  title: { fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { marginBottom: 12 },
  row: { flexDirection: 'row', marginBottom: 12 },
  flexInput: { flex: 1 },
  buttonRow: { flexDirection: 'row', marginTop: 10 },
  button: { flex: 1, marginHorizontal: 4 },
});