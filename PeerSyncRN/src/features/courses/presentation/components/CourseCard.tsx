import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, UIManager, LayoutAnimation, Platform } from 'react-native';
import { Text, Surface, useTheme, IconButton, Divider } from 'react-native-paper';

// Habilitar animaciones de Layout en Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface CourseProjectItem {
  title: string;
  subtitle: string;
  onTap?: (courseTitle: string, projectTitle: string) => void;
}

interface CourseCardProps {
  title: string;
  progressText: string;
  projects: CourseProjectItem[];
  initiallyExpanded?: boolean;
  leadingIcon?: string; // Usaremos los nombres de MaterialCommunityIcons
  onTap?: () => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  title,
  progressText,
  projects,
  initiallyExpanded = false,
  leadingIcon = 'api',
  onTap,
}) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded && projects.length > 0);
  const hasProjects = projects.length > 0;

  const toggleExpand = () => {
    if (!hasProjects) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
      <TouchableOpacity onPress={onTap} activeOpacity={0.8} style={styles.cardContent}>
        <View style={styles.headerRow}>
          {/* Icono Principal */}
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
            <IconButton icon={leadingIcon} iconColor={theme.colors.primary} size={24} />
          </View>

          {/* Textos del Header */}
          <View style={styles.headerTextContainer}>
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }} numberOfLines={1}>
              {title}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {progressText}
            </Text>
          </View>

          {/* Flecha de Expansión */}
          {hasProjects && (
            <IconButton
              icon={isExpanded ? 'chevron-up' : 'chevron-down'}
              iconColor={theme.colors.onSurface}
              onPress={toggleExpand}
              size={24}
            />
          )}
        </View>

        {/* Sección Expandible de Proyectos */}
        {isExpanded && hasProjects && (
          <View style={styles.projectsContainer}>
            <Divider style={styles.divider} />
            {projects.map((project, index) => (
              <TouchableOpacity
                key={index}
                style={styles.projectItem}
                onPress={() => project.onTap?.(title, project.title)}
              >
                <View style={styles.projectText}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, fontWeight: '500' }}>
                    {project.title}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {project.subtitle}
                  </Text>
                </View>
                <View style={[styles.chevronContainer, { borderColor: theme.colors.outlineVariant }]}>
                  <IconButton icon="chevron-right" size={16} iconColor={theme.colors.onSurfaceVariant} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </TouchableOpacity>
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    width: '100%',
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  projectsContainer: {
    marginTop: 8,
  },
  divider: {
    marginVertical: 12,
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  projectText: {
    flex: 1,
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});