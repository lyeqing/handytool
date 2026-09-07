export interface Category { id: number; name: string; description: string; subcategories: { id: number; name: string; description: string }[] }
export interface HomeRecord { id: number; objectDefinitionId: number; toolName: string; title: string | null; description: string | null; modifiedDate: string }
export interface HomeData {
  user: { id: number; displayName: string } | null;
  canCreateDefinition: boolean;
  categories: Category[];
  tools: { id: number; name: string; description: string; masterCategoryId: number }[];
  records: { items: HomeRecord[]; skip: number; take: number; total: number } | null;
}
