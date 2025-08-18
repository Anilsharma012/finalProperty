import CryptoJS from "crypto-js";

interface PhonePeConfig {
  merchantId: string;
  saltKey: string;
  saltIndex: string;
  testMode: boolean;
}

interface PaymentRequest {
  merchantTransactionId: string;
  merchantUserId: string;
  amount: number;
  redirectUrl: string;
  redirectMode: string;
  callbackUrl: string;
  mobileNumber?: string;
  paymentInstrument: {
    type: string;
    targetApp?: string;
  };
}

class PhonePeService {
  private config: PhonePeConfig | null = null;

  async loadConfig(): Promise<PhonePeConfig> {
    try {
      const response = await fetch("/api/admin/settings/phonepe");
      const data = await response.json();

      if (data.success && data.data.enabled) {
        this.config = data.data;
        return this.config;
      } else {
        throw new Error("PhonePe is not enabled or configured");
      }
    } catch (error) {
      console.error("Error loading PhonePe config:", error);
      throw error;
    }
  }

  generateTransactionId(): string {
    return `MT${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }

  generateChecksum(payload: string, endpoint: string): string {
    if (!this.config) {
      throw new Error("PhonePe config not loaded");
    }

    const data = payload + endpoint + this.config.saltKey;
    const hash = CryptoJS.SHA256(data).toString();
    return hash + "###" + this.config.saltIndex;
  }

  async initiatePayment(paymentData: {
    amount: number;
    packageId: string;
    propertyId?: string;
    userId: string;
    userPhone?: string;
  }): Promise<{
    success: boolean;
    data?: {
      instrumentResponse: {
        redirectInfo: {
          url: string;
          method: string;
        };
      };
    };
    error?: string;
  }> {
    try {
      if (!this.config) {
        await this.loadConfig();
      }

      if (!this.config) {
        throw new Error("PhonePe configuration not available");
      }

      const merchantTransactionId = this.generateTransactionId();
      const baseUrl = window.location.origin;

      const paymentRequest: PaymentRequest = {
        merchantTransactionId,
        merchantUserId: paymentData.userId,
        amount: paymentData.amount * 100, // Convert to paise
        redirectUrl: `${baseUrl}/payment-callback?packageId=${paymentData.packageId}&propertyId=${paymentData.propertyId || ""}&transactionId=${merchantTransactionId}`,
        redirectMode: "POST",
        callbackUrl: `${baseUrl}/api/payments/phonepe/callback`,
        mobileNumber: paymentData.userPhone,
        paymentInstrument: {
          type: "PAY_PAGE",
        },
      };

      // Convert to base64
      const payloadString = JSON.stringify(paymentRequest);
      const base64Payload = btoa(payloadString);

      // Generate checksum
      const endpoint = "/pg/v1/pay";
      const checksum = this.generateChecksum(base64Payload, endpoint);

      // API URL
      const apiUrl = this.config.testMode
        ? "https://api-preprod.phonepe.com/apis/pg-sandbox"
        : "https://api.phonepe.com/apis/hermes";

      // Make payment request
      const response = await fetch(`${apiUrl}/pg/v1/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
        },
        body: JSON.stringify({
          request: base64Payload,
        }),
      });

      const responseData = await response.json();

      if (responseData.success) {
        // Store transaction details locally
        localStorage.setItem(
          `phonepe_txn_${merchantTransactionId}`,
          JSON.stringify({
            packageId: paymentData.packageId,
            propertyId: paymentData.propertyId,
            amount: paymentData.amount,
            timestamp: Date.now(),
          }),
        );

        return {
          success: true,
          data: responseData.data,
        };
      } else {
        return {
          success: false,
          error: responseData.message || "Payment initiation failed",
        };
      }
    } catch (error: any) {
      console.error("PhonePe payment error:", error);
      return {
        success: false,
        error: error.message || "Failed to initiate PhonePe payment",
      };
    }
  }

  async checkPaymentStatus(transactionId: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      if (!this.config) {
        await this.loadConfig();
      }

      if (!this.config) {
        throw new Error("PhonePe configuration not available");
      }

      const endpoint = `/pg/v1/status/${this.config.merchantId}/${transactionId}`;
      const checksum = this.generateChecksum("", endpoint);

      const apiUrl = this.config.testMode
        ? "https://api-preprod.phonepe.com/apis/pg-sandbox"
        : "https://api.phonepe.com/apis/hermes";

      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
          "X-MERCHANT-ID": this.config.merchantId,
        },
      });

      const responseData = await response.json();

      return {
        success: responseData.success,
        data: responseData.data,
        error: responseData.success ? undefined : responseData.message,
      };
    } catch (error: any) {
      console.error("PhonePe status check error:", error);
      return {
        success: false,
        error: error.message || "Failed to check payment status",
      };
    }
  }

  // For UPI deep linking (optional)
  generateUPILink(paymentData: {
    amount: number;
    transactionId: string;
    note: string;
  }): string {
    const { amount, transactionId, note } = paymentData;

    // This would need the merchant VPA from PhonePe
    const upiId = "merchant@phonepe"; // Replace with actual merchant UPI ID

    return `upi://pay?pa=${upiId}&pn=Aashish Property&am=${amount}&cu=INR&tn=${note}&tr=${transactionId}`;
  }
}

export const phonePeService = new PhonePeService();
export default PhonePeService;
