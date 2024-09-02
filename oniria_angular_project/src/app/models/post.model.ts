import { ICategory } from "./category.models";

export interface IPost {
    id: number;
    user: number;
    category: number[];
    categories: ICategory[];
    people_involved: number[];
    title: string;
    content: string;
    post_date: Date;
    dream_date: Date;
    public_date: Date;
    privacy: string;
}
