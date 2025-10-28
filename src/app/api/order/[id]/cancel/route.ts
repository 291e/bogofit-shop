import { NextRequest, NextResponse } from "next/server";
import { safeJsonParse } from "@/lib/api-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || "test_sk_4yKeq5bgrpWvWbKAp27AVGX0lzW6";
const TOSS_API_URL = process.env.TOSS_API_URL || "https://api.tosspayments.com/v1";

/**
 * POST /api/order/[id]/cancel
 * Cancel order (customer only)
 * id can be either UUID or OrderNo (BOGOFIT-xxx)
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const token = request.headers.get("authorization");

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Authorization required" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { reason = "구매자 요청" } = body;

        // console.log(`[ORDER-CANCEL] Customer canceling order ${id}`, {
        //     reason,
        //     timestamp: new Date().toISOString()
        // });

        // First, get order details to find paymentKey
        const orderResponse = await fetch(
            `${API_URL}/api/Order/${id}`,
            {
                method: "GET",
                headers: {
                    Authorization: token,
                    "Content-Type": "application/json",
                },
            }
        );

        const orderResult = await safeJsonParse(orderResponse);
        if (!orderResult.success) {
            console.error(`[ORDER-CANCEL] Failed to get order details:`, orderResult);
            return NextResponse.json(orderResult, { status: orderResult.status || 500 });
        }

        // The /api/order/{id} endpoint returns { success: true, data: {...} }
        const orderData = (orderResult.data as Record<string, unknown>).data as Record<string, unknown>;
        const paymentKey = orderData.paymentKey;

        if (!paymentKey) {
            // console.log(`[ORDER-CANCEL] No payment key found, skipping Toss cancellation`);
        } else {
            // Step 1: Cancel with Toss Payments
            const encryptedSecretKey = "Basic " + Buffer.from(TOSS_SECRET_KEY + ":").toString("base64");

            const tossRequest = {
                method: "POST",
                headers: {
                    "Authorization": encryptedSecretKey,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    cancelReason: reason,
                }),
            };

            const tossResponse = await fetch(`${TOSS_API_URL}/payments/${paymentKey}/cancel`, tossRequest);

            const tossData = await tossResponse.json();

            if (!tossResponse.ok) {
                console.error(`[ORDER-CANCEL] Toss cancellation failed:`, tossData);

                // Check if payment is already canceled or not cancelable
                if (tossData.code === "NOT_CANCELABLE_PAYMENT" ||
                    tossData.code === "ALREADY_CANCELED" ||
                    tossData.message?.includes("취소 할 수 없는")) {
                    // console.log(`[ORDER-CANCEL] Payment already canceled or not cancelable, continuing with database update`);
                } else {
                    return NextResponse.json(
                        {
                            success: false,
                            message: tossData.message || "Payment cancellation failed with Toss",
                            code: tossData.code,
                        },
                        { status: tossResponse.status }
                    );
                }
            } else {
                // console.log(`[ORDER-CANCEL] Payment successfully canceled with Toss!`);
            }
        }

        // Step 2: Update C# backend database
        const response = await fetch(
            `${API_URL}/api/Order/${id}/cancel`,
            {
                method: "POST",
                headers: {
                    Authorization: token,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    reason,
                    canceledBy: "customer"
                }),
            }
        );

        // console.log(`[ORDER-CANCEL] Backend response:`, {
        //     status: response.status,
        //     statusText: response.statusText,
        //     contentType: response.headers.get('content-type'),
        //     url: `${API_URL}/api/Order/${id}/cancel`
        // });

        const result = await safeJsonParse(response);

        if (!result.success) {
            console.error(`[ORDER-CANCEL] Backend error:`, result);

            // Try to get the actual error message from the response
            try {
                const errorText = await response.text();
                console.log(`[ORDER-CANCEL] Backend error details:`, errorText);
            } catch {
                console.log(`[ORDER-CANCEL] Could not read error response`);
            }

            return NextResponse.json(result, { status: result.status || 500 });
        }

        const data = result.data;
        // console.log(`[ORDER-CANCEL] Order ${id} canceled successfully`);

        return NextResponse.json({
            success: true,
            message: "주문이 취소되었습니다",
            data
        }, { status: response.status });

    } catch (error) {
        console.error("Cancel Order API Error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}
