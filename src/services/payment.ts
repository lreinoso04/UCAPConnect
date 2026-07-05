import { API_BASE_URL } from "@/config";
import { loadAuth } from "../storage/authStorage";

export async function createPaymentIntent() {

    const auth = await loadAuth();

    if (!auth?.token) {
        throw new Error("Usuario no autenticado");
    }

    const response = await fetch(
        `${API_BASE_URL}/api/v1/payments/create`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error("Error creando PaymentIntent");
    }

    return await response.json();
}