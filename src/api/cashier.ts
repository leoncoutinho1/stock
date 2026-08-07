import { http } from "./client";
import type { ResultList } from "./types";

export interface Cashier {
    id: number | string;
    name: string;
    createdAt?: string;
}

export interface CashierInsertDTO {
    name: string;
}

export interface CashierUpdateDTO {
    id: number | string;
    name: string;
}

export interface CashierFilter {
    name?: string;
    limit?: number;
    offset?: number;
}

export async function listCashiers(
    filters?: CashierFilter
): Promise<ResultList<Cashier>> {
    const params = new URLSearchParams();
    if (filters?.name) params.append("name", filters.name);
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.offset) params.append("offset", filters.offset.toString());

    const query = params.toString();
    const path = `/Cashier/ListCashier${query ? `?${query}` : ""}`;
    return http<ResultList<Cashier>>(path);
}

export async function getCashier(id: number | string): Promise<Cashier> {
    return http<Cashier>(`/Cashier/${id}`);
}

export async function createCashier(
    cashier: CashierInsertDTO
): Promise<Cashier> {
    return http<Cashier>("/Cashier", {
        method: "POST",
        body: JSON.stringify(cashier),
    });
}

export async function updateCashier(
    cashier: CashierUpdateDTO
): Promise<Cashier> {
    return http<Cashier>(`/Cashier/${cashier.id}`, {
        method: "PUT",
        body: JSON.stringify(cashier),
    });
}

export async function deleteCashier(id: number | string): Promise<void> {
    return http<void>(`/Cashier/${id}`, {
        method: "DELETE",
    });
}

export const cashierApi = {
    getCashiers: listCashiers,
    getCashier,
    createCashier,
    updateCashier,
    deleteCashier,
};
