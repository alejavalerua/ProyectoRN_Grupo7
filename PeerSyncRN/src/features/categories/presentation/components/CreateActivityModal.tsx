import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Platform,
  Modal as RNModal,
} from "react-native";
import {
  Modal,
  Portal,
  Text,
  TextInput,
  Button,
  Switch,
  useTheme,
} from "react-native-paper";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface CreateActivityModalProps {
  visible: boolean;
  onDismiss: () => void;
  onCreate: (data: {
    name: string;
    startDate: Date;
    endDate: Date;
    isPublic: boolean;
  }) => void;
}

type PickerMode = "startDate" | "endDate" | "startTime" | "endTime" | null;

export const CreateActivityModal: React.FC<CreateActivityModalProps> = ({
  visible,
  onDismiss,
  onCreate,
}) => {
  const theme = useTheme();

  const initialStart = useMemo(() => new Date(), []);
  const initialEnd = useMemo(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    return d;
  }, []);

  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [startDate, setStartDate] = useState<Date>(initialStart);
  const [endDate, setEndDate] = useState<Date>(initialEnd);
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);

  const resetForm = () => {
    const now = new Date();
    const later = new Date();
    later.setHours(later.getHours() + 1);

    setName("");
    setIsPublic(true);
    setStartDate(now);
    setEndDate(later);
    setPickerMode(null);
  };

  const handleDismiss = () => {
    resetForm();
    onDismiss();
  };

  const openPicker = (mode: PickerMode) => {
    setPickerMode(mode);
  };

  const closePicker = () => {
    setPickerMode(null);
  };

  const formatDate = (date: Date) => {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yy = String(date.getFullYear()).slice(-2);
    return `${dd} / ${mm} / ${yy}`;
  };

  const formatTime = (date: Date) => {
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${hh} : ${mm}`;
  };

  const currentPickerValue =
    pickerMode === "startDate" || pickerMode === "startTime"
      ? startDate
      : endDate;

  const nativeMode =
    pickerMode === "startTime" || pickerMode === "endTime" ? "time" : "date";

  const applyPickedValue = (selectedDate: Date) => {
    if (!pickerMode) return;

    if (pickerMode === "startDate") {
      const updated = new Date(startDate);
      updated.setFullYear(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      );
      setStartDate(updated);

      if (updated > endDate) {
        const nextEnd = new Date(updated);
        nextEnd.setHours(updated.getHours() + 1);
        setEndDate(nextEnd);
      }
    }

    if (pickerMode === "endDate") {
      const updated = new Date(endDate);
      updated.setFullYear(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      );
      setEndDate(updated);
    }

    if (pickerMode === "startTime") {
      const updated = new Date(startDate);
      updated.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
      setStartDate(updated);

      if (updated > endDate) {
        const nextEnd = new Date(updated);
        nextEnd.setHours(updated.getHours() + 1);
        setEndDate(nextEnd);
      }
    }

    if (pickerMode === "endTime") {
      const updated = new Date(endDate);
      updated.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
      setEndDate(updated);
    }
  };

  const handlePickerChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (Platform.OS === "android") {
      if (event.type === "dismissed" || !selectedDate) {
        setPickerMode(null);
        return;
      }

      applyPickedValue(selectedDate);
      setPickerMode(null);
    }
  };

  const handleCreate = () => {
    if (!name.trim()) return;

    onCreate({
      name: name.trim(),
      startDate,
      endDate,
      isPublic,
    });

    resetForm();
  };

  const isFormValid = name.trim().length > 0;

  return (
    <>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={handleDismiss}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            Crear Actividad
          </Text>

          <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
            Nombre (*)
          </Text>
          <TextInput
            mode="outlined"
            value={name}
            onChangeText={setName}
            placeholder="Taller 1"
            style={styles.input}
            outlineStyle={styles.outline}
          />

          <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
            Fecha Inicio
          </Text>
          <Pressable onPress={() => openPicker("startDate")}>
            <View pointerEvents="none">
              <TextInput
                mode="outlined"
                value={formatDate(startDate)}
                editable={false}
                style={styles.input}
                outlineStyle={styles.outline}
                right={
                  <TextInput.Icon
                    icon={() => (
                      <MaterialCommunityIcons
                        name="calendar-outline"
                        size={22}
                        color={theme.colors.onSurfaceVariant}
                      />
                    )}
                  />
                }
              />
            </View>
          </Pressable>

          <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
            Fecha Fin
          </Text>
          <Pressable onPress={() => openPicker("endDate")}>
            <View pointerEvents="none">
              <TextInput
                mode="outlined"
                value={formatDate(endDate)}
                editable={false}
                style={styles.input}
                outlineStyle={styles.outline}
                right={
                  <TextInput.Icon
                    icon={() => (
                      <MaterialCommunityIcons
                        name="calendar-outline"
                        size={22}
                        color={theme.colors.onSurfaceVariant}
                      />
                    )}
                  />
                }
              />
            </View>
          </Pressable>

          <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
            Hora Inicio
          </Text>

          <View style={styles.timeRow}>
            <Pressable style={styles.timePressable} onPress={() => openPicker("startTime")}>
              <View pointerEvents="none">
                <TextInput
                  mode="outlined"
                  value={formatTime(startDate)}
                  editable={false}
                  style={styles.timeInput}
                  outlineStyle={styles.outline}
                  right={
                    <TextInput.Icon
                      icon={() => (
                        <MaterialCommunityIcons
                          name="clock-outline"
                          size={20}
                          color={theme.colors.onSurfaceVariant}
                        />
                      )}
                    />
                  }
                />
              </View>
            </Pressable>

            <Text style={[styles.timeDash, { color: theme.colors.onSurface }]}>-</Text>

            <Pressable style={styles.timePressable} onPress={() => openPicker("endTime")}>
              <View pointerEvents="none">
                <TextInput
                  mode="outlined"
                  value={formatTime(endDate)}
                  editable={false}
                  style={styles.timeInput}
                  outlineStyle={styles.outline}
                  right={
                    <TextInput.Icon
                      icon={() => (
                        <MaterialCommunityIcons
                          name="clock-outline"
                          size={20}
                          color={theme.colors.onSurfaceVariant}
                        />
                      )}
                    />
                  }
                />
              </View>
            </Pressable>
          </View>

          <View style={styles.switchRow}>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              color={theme.colors.primary}
            />
            <Text style={[styles.switchLabel, { color: theme.colors.onSurfaceVariant }]}>
              Público
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <Button
              mode="outlined"
              onPress={handleDismiss}
              style={[styles.button, styles.cancelButton]}
              contentStyle={styles.buttonContent}
              labelStyle={[styles.cancelLabel, { color: theme.colors.primary }]}
            >
              Cancelar
            </Button>

            <Button
              mode="contained"
              onPress={handleCreate}
              disabled={!isFormValid}
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              contentStyle={styles.buttonContent}
              labelStyle={styles.createLabel}
            >
              Crear
            </Button>
          </View>
        </Modal>
      </Portal>

      {Platform.OS === "android" && pickerMode && (
        <DateTimePicker
          value={currentPickerValue}
          mode={nativeMode}
          display="default"
          is24Hour={false}
          onChange={handlePickerChange}
        />
      )}

      {Platform.OS === "ios" && pickerMode && (
        <RNModal
          transparent
          animationType="fade"
          visible={!!pickerMode}
          onRequestClose={closePicker}
        >
          <View style={styles.iosPickerOverlay}>
            <View style={[styles.iosPickerCard, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.iosPickerTitle, { color: theme.colors.onSurface }]}>
                {nativeMode === "time" ? "Seleccionar hora" : "Seleccionar fecha"}
              </Text>

              <DateTimePicker
                value={currentPickerValue}
                mode={nativeMode}
                display="spinner"
                is24Hour={false}
                onChange={(_, selectedDate) => {
                  if (selectedDate) applyPickedValue(selectedDate);
                }}
                style={styles.iosPicker}
              />

              <View style={styles.iosPickerButtons}>
                <Button onPress={closePicker} labelStyle={{ color: theme.colors.primary }}>
                  Cancelar
                </Button>
                <Button onPress={closePicker} labelStyle={{ color: theme.colors.primary }}>
                  OK
                </Button>
              </View>
            </View>
          </View>
        </RNModal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  modal: {
    alignSelf: "center",
    width: "88%",
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 18,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 2,
  },
  input: {
    marginBottom: 14,
    backgroundColor: "transparent",
  },
  outline: {
    borderRadius: 16,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  timePressable: {
    flex: 1,
  },
  timeInput: {
    backgroundColor: "transparent",
  },
  timeDash: {
    marginHorizontal: 10,
    fontSize: 22,
    fontWeight: "700",
    marginTop: -4,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    marginTop: 2,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 18,
  },
  cancelButton: {
    borderWidth: 2,
  },
  buttonContent: {
    height: 52,
  },
  cancelLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  createLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  iosPickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  iosPickerCard: {
    borderRadius: 24,
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  iosPickerTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  iosPicker: {
    alignSelf: "center",
  },
  iosPickerButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    gap: 8,
  },
});