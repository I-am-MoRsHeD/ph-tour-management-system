/* eslint-disable @typescript-eslint/no-explicit-any */
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import { Payment } from "../payment/payment.model";
import { ISSLCommerz } from "./sslCommerz.interface";
import axios from 'axios';


const sslPaymentInit = async (payload: ISSLCommerz) => {

    try {
        const data = {
            store_id: envVars.SSL.SSL_STORE_ID,
            store_passwd: envVars.SSL.SSL_STORE_PASS,
            total_amount: payload.amount,
            currency: "BDT",
            tran_id: payload.transactionId,
            success_url: `${envVars.SSL.SSL_SUCCESS_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=success`,
            fail_url: `${envVars.SSL.SSL_FAIL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=fail`,
            cancel_url: `${envVars.SSL.SSL_CANCEL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=cancel`,
            ipn_url: envVars.SSL.SSL_IPN_URL,
            shipping_method: "N/A", // eikane ja iccha dewa jabhe,but related dile balo
            product_name: "Tour", // eikane ja iccha dewa jabhe,but related dile balo
            product_category: "Service", // eikane ja iccha dewa jabhe,but related dile balo
            product_profile: "general", // eikane ja iccha dewa jabhe,but related dile balo
            cus_name: payload.name,
            cus_email: payload.email,
            cus_add1: payload.address,
            cus_add2: "N/A", // eita mendatory,tai dite hoise
            cus_city: "Dhaka", // eita mendatory,tai dite hoise
            cus_state: "Dhaka", // eita mendatory,tai dite hoise
            cus_postcode: "1000", // eita mendatory,tai dite hoise
            cus_country: "Bangladesh", // eita mendatory,tai dite hoise
            cus_phone: payload.phone,
            cus_fax: "01711111111",
            ship_name: "N/A",
            ship_add1: "N/A",
            ship_add2: "N/A",
            ship_city: "N/A",
            ship_state: "N/A",
            ship_postcode: 1000,
            ship_country: "N/A",
        };

        const res = await axios({
            method: 'POST',
            url: envVars.SSL.SSL_PAYMENT_API,
            data: data,
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });

        return res.data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.log("Payment error occured", error.message);
    }
};

const validatePayment = async (payload: any) => {
    try {
        const res = await axios({
            method: 'GET',
            url: `${envVars.SSL.SSL_VALIDATION_API}?val_id=${payload.val_id}&store_id=${envVars.SSL.SSL_STORE_ID}&store_passwd=${envVars.SSL.SSL_STORE_PASS}`
        });
        console.log("validate payment response", res.data);
        await Payment.updateOne(
            { transactionId: payload.tran_id },
            { paymentGatewayData: res.data },
            { runValidators: true })

    } catch (error: any) {
        console.log(error);
        throw new AppError(401, `Payment validation error ${error.message}`);
    }
};


export const SSLServices = { sslPaymentInit, validatePayment };