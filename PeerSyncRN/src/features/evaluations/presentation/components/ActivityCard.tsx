import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Surface, useTheme, Icon } from "react-native-paper";

interface ActivityCardProps {
  title: string;
  month: string;
  day: string;
  statusTag: string;
  statusDetail: string;
  dateBgColor: string;
  dateTextColor: string;
  onTap: () => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  title,
  month,
  day,
  statusTag,
  statusDetail,
  dateBgColor,
  dateTextColor,
  onTap,
}) => {
  const theme = useTheme();

  const isExpired = statusTag.toLowerCase() === "vencida";

  const finalDateBgColor = isExpired ? "#E5E7EB" : dateBgColor;
  const finalDateTextColor = isExpired ? "#6B7280" : dateTextColor;

  const tagBackgroundColor = isExpired ? "#E5E7EB" : "#EDE9FE";
  const tagBorderColor = isExpired ? "#D1D5DB" : "#DDD6FE";
  const tagTextColor = isExpired ? "#6B7280" : theme.colors.primary;
  const chevronColor = isExpired ? "#6B7280" : theme.colors.onSurfaceVariant;

  return (
    <Surface
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      elevation={2}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onTap}
        style={styles.content}
      >
        <View style={[styles.dateBox, { backgroundColor: finalDateBgColor }]}>
          <Text style={[styles.monthText, { color: finalDateTextColor }]}>
            {month}
          </Text>
          <Text style={[styles.dayText, { color: finalDateTextColor }]}>
            {day}
          </Text>
        </View>

        <View style={styles.details}>
          <Text
            variant="titleMedium"
            style={[styles.title, { color: theme.colors.onSurface }]}
            numberOfLines={1}
          >
            {title}
          </Text>

          <View style={styles.tagRow}>
            <View
              style={[
                styles.tagPill,
                {
                  backgroundColor: tagBackgroundColor,
                  borderColor: tagBorderColor,
                },
              ]}
            >
              <Text style={[styles.tagText, { color: tagTextColor }]}>
                {statusTag}
              </Text>
            </View>

            <Text
              style={[
                styles.detailText,
                { color: theme.colors.onSurfaceVariant },
              ]}
              numberOfLines={1}
            >
              {statusDetail}
            </Text>
          </View>
        </View>

        <Icon source="chevron-right" size={24} color={chevronColor} />
      </TouchableOpacity>
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    padding: 18,
    alignItems: "center",
  },
  dateBox: {
    width: 68,
    height: 68,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  monthText: {
    fontSize: 15,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  dayText: {
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 28,
  },
  details: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "center",
  },
  title: {
    fontWeight: "700",
    marginBottom: 8,
    fontSize: 17,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "700",
  },
  detailText: {
    fontSize: 12,
    flexShrink: 1,
  },
});
