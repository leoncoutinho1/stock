import { http } from "./client";
import type { ResultList } from "./types";

export interface Category {
    id: string;
    description: string;
    createdAt: string;
}

export interface CategoryInsertDTO {
    description: string;
}

export interface CategoryUpdateDTO {
    id: string;
    description: string;
}

export interface CategoryFilter {
    description?: string;
    limit?: number;
    offset?: number;
}

export async function listCategories(
    filters?: CategoryFilter
): Promise<ResultList<Category>> {
    const params = new URLSearchParams();
    if (filters?.description) params.append("description", filters.description);
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.offset) params.append("offset", filters.offset.toString());

    const query = params.toString();
    const path = `/Category/ListCategory${query ? `?${query}` : ""}`;
    return http<ResultList<Category>>(path);
}

export async function getCategory(id: string): Promise<Category> {
    return http<Category>(`/Category/${id}`);
}

export async function createCategory(
    category: CategoryInsertDTO
): Promise<Category> {
    return http<Category>("/Category", {
        method: "POST",
        body: JSON.stringify(category),
    });
}

export async function updateCategory(
    category: CategoryUpdateDTO
): Promise<Category> {
    return http<Category>(`/Category/${category.id}`, {
        method: "PUT",
        body: JSON.stringify(category),
    });
}

export async function deleteCategory(id: string): Promise<void> {
    return http<void>(`/Category/${id}`, {
        method: "DELETE",
    });
}
