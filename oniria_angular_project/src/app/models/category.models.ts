export interface ICategory {
    id: number;
    name: string;
    description: string;
    user: null;
    is_default: boolean;
    selected?: boolean;
}
