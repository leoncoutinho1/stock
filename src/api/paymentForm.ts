import { http } from "./client";
import type { ResultList } from "./types";

export interface PaymentForm {
    id: number | string;
    name?: string;
    description?: string;
    createdAt?: string;
}

export interface PaymentFormInsertDTO {
    name?: string;
    description?: string;
}

export interface PaymentFormUpdateDTO {
    id: number | string;
    name?: string;
    description?: string;
}

export interface PaymentFormFilter {
    description?: string;
    limit?: number;
    offset?: number;
}

export async function listPaymentForms(
    filters?: PaymentFormFilter
): Promise<ResultList<PaymentForm>> {
    const params = new URLSearchParams();
    if (filters?.description) params.append("description", filters.description);
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.offset) params.append("offset", filters.offset.toString());

    const query = params.toString();
    const path = `/PaymentForm/ListPaymentForm${query ? `?${query}` : ""}`;
    return http<ResultList<PaymentForm>>(path);
}

export async function getPaymentForm(id: number | string): Promise<PaymentForm> {
    return http<PaymentForm>(`/PaymentForm/${id}`);
}

export async function createPaymentForm(
    paymentForm: PaymentFormInsertDTO
): Promise<PaymentForm> {
    return http<PaymentForm>("/PaymentForm", {
        method: "POST",
        body: JSON.stringify(paymentForm),
    });
}

export async function updatePaymentForm(
    paymentForm: PaymentFormUpdateDTO
): Promise<PaymentForm> {
    return http<PaymentForm>(`/PaymentForm/${paymentForm.id}`, {
        method: "PUT",
        body: JSON.stringify(paymentForm),
    });
}

export async function deletePaymentForm(id: number | string): Promise<void> {
    return http<void>(`/PaymentForm/${id}`, {
        method: "DELETE",
    });
}

export const paymentFormApi = {
    getPaymentForms: listPaymentForms,
    getPaymentForm,
    createPaymentForm,
    updatePaymentForm,
    deletePaymentForm,
};
