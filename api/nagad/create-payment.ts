/**
 * Nagad Payment API
 * Creates a Nagad payment request
 */

import axios from "axios";
import crypto from "crypto";

const NAGAD_BASE_URL = process.env.NAGAD_BASE_URL || "https://sandbox.mynagad.com:10080/remote-payment-gateway-1.0/api/dfs";
const MERCHANT_ID = process.env.NAGAD_MERCHANT_ID;
const MERCHANT_NUMBER = process.env.NAGAD_MERCHANT_NUMBER;

/**
 * Generate Nagad signature
 */
function generateSignature(data: string, privateKey: string): string {
  const sign = crypto.createSign("SHA256");
  sign.update(data);
  sign.end();
  return sign.sign(privateKey, "base64");
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, amount } = req.body;

  if (!userId || !amount) {
    return res.status(400).json({ error: "User ID and amount are required" });
  }

  try {
    const orderId = `ENZ${Date.now()}`;
    const timestamp = Date.now().toString();

    // Step 1: Initialize payment
    const sensitiveData = {
      merchantId: MERCHANT_ID,
      datetime: timestamp,
      orderId,
      challenge: crypto.randomBytes(20).toString("hex"),
    };

    const sensitiveDataString = JSON.stringify(sensitiveData);
    const signature = generateSignature(sensitiveDataString, process.env.NAGAD_PRIVATE_KEY || "");

    const initResponse = await axios.post(
      `${NAGAD_BASE_URL}/check-out/initialize/${MERCHANT_ID}/${orderId}`,
      {
        dateTime: timestamp,
        sensitiveData: Buffer.from(sensitiveDataString).toString("base64"),
        signature,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-KM-Api-Version": "v-0.2.0",
          "X-KM-IP-V4": req.headers["x-forwarded-for"] || req.connection.remoteAddress,
          "X-KM-Client-Type": "PC_WEB",
        },
      }
    );

    const paymentRef = initResponse.data.paymentReferenceId;
    const challenge = initResponse.data.challenge;

    // Step 2: Complete payment
    const paymentData = {
      merchantId: MERCHANT_ID,
      orderId,
      currencyCode: "050", // BDT
      amount: amount.toString(),
      challenge,
    };

    const paymentDataString = JSON.stringify(paymentData);
    const paymentSignature = generateSignature(paymentDataString, process.env.NAGAD_PRIVATE_KEY || "");

    const completeResponse = await axios.post(
      `${NAGAD_BASE_URL}/check-out/complete/${paymentRef}`,
      {
        merchantId: MERCHANT_ID,
        orderId,
        paymentReferenceId: paymentRef,
        currencyCode: "050",
        amount: amount.toString(),
        challenge,
        additionalMerchantInfo: {
          userId,
        },
        sensitiveData: Buffer.from(paymentDataString).toString("base64"),
        signature: paymentSignature,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-KM-Api-Version": "v-0.2.0",
          "X-KM-IP-V4": req.headers["x-forwarded-for"] || req.connection.remoteAddress,
          "X-KM-Client-Type": "PC_WEB",
        },
      }
    );

    if (completeResponse.data.callBackUrl) {
      return res.status(200).json({
        nagadURL: completeResponse.data.callBackUrl,
        paymentRef,
      });
    } else {
      return res.status(400).json({
        error: "Failed to create Nagad payment",
      });
    }
  } catch (error: any) {
    console.error("Nagad payment creation error:", error.response?.data || error.message);
    return res.status(500).json({
      error: error.response?.data?.message || "Failed to create Nagad payment",
    });
  }
}
