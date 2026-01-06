import { http } from "./client";
import type { ResultList } from "./types";

export interface Checkout {
    id: string;
    name: string;
    createdAt: string;
}

export interface CheckoutInsertDTO {
    name: string;
}

export interface CheckoutUpdateDTO {
    id: string;
    name: string;
}

export interface CheckoutFilter {
    name?: string;
    limit?: number;
    offset?: number;
}

export async function listCheckouts(
    filters?: CheckoutFilter
): Promise<ResultList<Checkout>> {
    const params = new URLSearchParams();
    if (filters?.name) params.append("name", filters.name);
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.offset) params.append("offset", filters.offset.toString());

    const query = params.toString();
    const path = `/Checkout/ListCheckout${query ? `?${query}` : ""}`;
    return http<ResultList<Checkout>>(path);
}

export async function getCheckout(id: string): Promise<Checkout> {
    return http<Checkout>(`/Checkout/${id}`);
}

export async function createCheckout(
    checkout: CheckoutInsertDTO
): Promise<Checkout> {
    return http<Checkout>("/Checkout", {
        method: "POST",
        body: JSON.stringify(checkout),
    });
}

export async function updateCheckout(
    checkout: CheckoutUpdateDTO
): Promise<Checkout> {
    return http<Checkout>(`/Checkout/${checkout.id}`, {
        method: "PUT",
        body: JSON.stringify(checkout),
    });
}

export async function deleteCheckout(id: string): Promise<void> {
    return http<void>(`/Checkout/${id}`, {
        method: "DELETE",
    });
}
