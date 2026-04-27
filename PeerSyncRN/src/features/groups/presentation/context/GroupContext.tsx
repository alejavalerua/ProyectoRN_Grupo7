import React, { createContext, useContext, useState, useCallback } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { GroupRepository } from '../../domain/repositories/GroupRepository';
import { useDI } from '../../../../core/di/DIProvider';
import { TOKENS } from '../../../../core/di/tokens';
import { showAlert } from '../../../../core/utils/alerts';

interface GroupContextProps {
  isLoading: boolean;
  importCsvData: (courseId: string, csvString: string) => Promise<boolean>;
  pickAndImportCsv: (courseId: string) => Promise<boolean>;
}

const GroupContext = createContext<GroupContextProps | undefined>(undefined);

export const GroupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const container = useDI();
  const repository = container.resolve<GroupRepository>(TOKENS.GroupRepo);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 1. Método que recibe el string directamente (Útil para pruebas o flujos directos)
  const importCsvData = useCallback(async (courseId: string, csvString: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log("Importando grupos desde CSV...");
      
      await repository.importGroupsFromCsv(courseId, csvString);
      
      console.log("Grupos importados exitosamente");
      showAlert('Éxito', '¡Grupos importados exitosamente!');
      
      return true; // Retornamos true para que la UI sepa que debe refrescar las categorías
    } catch (e: any) {
      showAlert('Error', e.message || 'Ocurrió un error al importar los grupos');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  // 2. Método que abre el selector de archivos, lee el texto y lo manda al repositorio
  const pickAndImportCsv = useCallback(async (courseId: string): Promise<boolean> => {
    try {
      // Abre el selector de archivos nativo
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/csv'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return false; // El usuario canceló
      }

      setIsLoading(true);
      const file = result.assets[0];

      // En Expo/React Native, fetch puede leer archivos locales URI y devolver su texto
      const response = await fetch(file.uri);
      const csvString = await response.text();

      await repository.importGroupsFromCsv(courseId, csvString);
      
      showAlert('Éxito', '¡Grupos importados exitosamente!');
      return true;

    } catch (e: any) {
      showAlert('Error', e.message || 'Ocurrió un error leyendo el archivo CSV');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  return (
    <GroupContext.Provider
      value={{
        isLoading,
        importCsvData,
        pickAndImportCsv,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};

export const useGroup = (): GroupContextProps => {
  const context = useContext(GroupContext);
  if (!context) throw new Error('useGroup debe usarse dentro de un GroupProvider');
  return context;
};