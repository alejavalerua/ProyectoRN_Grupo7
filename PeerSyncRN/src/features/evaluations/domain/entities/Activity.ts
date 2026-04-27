export interface Activity {
  id: string;
  categoryId: string;
  name: string;
  description?: string; // Opcional (puede ser undefined/null)
  startDate: Date;      // DateTime pasa a Date
  endDate: Date;
  visibility: boolean;
}