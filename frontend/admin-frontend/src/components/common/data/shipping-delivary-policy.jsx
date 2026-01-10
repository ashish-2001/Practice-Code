const ShippingAndDeliveryPolicy = {
    title: 'Shipping & Delivery Policy',
    breadCrumb: ['Home', 'Delivery Policy'],
    subTitle: 'At Palmonas, we partner with trusted courier services to ensure your orders reach you safely and efficiently.',
    heading1: {
        subHeading: 'Dispatch Timelines: ',
        desc1: "Delivery estimates are shown at the product pages & checkout. These estimates depend on your specific pincode and the items you've chosen."
    },
    heading2: {
        subHeading: 'Shipping Charges: ',
        desc1: 'Prepaid orders: free shipping across india.',
        desc2: 'Cash on Delivery(COD): $75 COD charge is Applicable(COD not available for LGD & Fine Gold items)',
    },
    heading3: {
        subHeading: 'Order Tracking',
        desc1: "'You'll receive a tracking link via SMS, Whatsapp and email.",
        desc2: 'For any query, contact us at https://support.palmonas.com/.'
    },
    heading4: {
        subHeading: 'Delays & Exceptions: ',
        desc1: 'Occasional delays may occur due to weather, local restrictions, or courier-related issues.',
        desc2: 'If your address becomes unserviceable, our team will contact with alternatives or a refund.'
    }
}

const PaymentPolicy = {

    title: 'Payment Policy',
    breadCrumb: ['Home', 'Payment Policy'],
    intro: 'Palmonas accepts the following payment methods for purchases made on Palmonas.com',
    paymentMethods: {
        title: 'Accepted Payment Methods:',
        prepaidPayments: {
            heading: 'Prepaid Payments: ',
            Cards: 'Credit Cards, Debit Cards, UPI, Net Banking, Wallets'
        },
        cashOnDelivery: {
            heading: 'Cash on Delivery(COD): ',
            desc: 'Available for selected orders as per the given conditions below',
            eligibility: {
                title: 'COD Eligibility Restrictions: ',
                desc: 'COD is not available in the following cases',
                criteria: {
                    heading1: '1. Orders containing: ',
                    desc: {
                        desc1: 'Lab-Grown Diamond(LGD) jewelry',
                        desc2: 'Gold jewelry(9K, 14K & 18K)'
                    },
                    heading2: {
                        desc: '2. Orders above 10,000 in value'
                    },
                    heading3: {
                        desc: '3. International Orders'
                    },
                    description1: 'All such orders must be placed using prepaid payment options only.',
                    description2: 'If you have any questions or facing payment issues, feel free to contact us at `${https://support.palmonas.com/}`'
                }
            }
        }
    }
};

const ReturnAndExchangePolicy = {
    title: 'Return & Exchange Policy',
    breadCrumb: ['Home', 'Return & Exchange Policy'],
    heading1: "At Palmonas, shop with confidence with our no questions asked return policy. Here's our clear and transparent policy for returns, exchanges, and refunds.",
    heading2: {
        heading: 'For Demifine, GOld, and Lab-Grown Diamonds (LGD):',
        desc1: 'You can raise a return request from here within 2 days of the delivery of the order.',
        desc2: 'Return of products purchased under Buy 1 Get 1 or other related offers would be eligible for refund to Palmonas Wallet.',
        desc3: 'Items sold at a strike-through or discounted price(without applying a coupon) are eligible for return.',
    },
    heading3: {
        heading: 'Return Conditions: ',
        desc1: 'Items must be unused with original packaging and tags intact.',
        desc2: 'An Unboxing video is required to process any claims for missing items in your order.Please ensure you record the packaging being opened from the sealed state for your claim to be considered'
    },
    heading4: {
        heading: 'Initiating a Return Request',
        desc1: '1. Go to the Return/Exchange section on the Palmonas website or menu or follow this link: https://returns.palmonas.com/login',
        desc2: '2. Enter your Palmonas Order ID and Contact Number. Ensure the Order Id is correctly entered, beginning with #PM1570',
        desc3: '3. Choose the items you wish to return',
        desc4: '4. Provide necessary details: select a return reason, upload a minimum of two images, specify the pickup address and date, and choose your refund method.',
        desc5: '5. Review your information and confirm the return request.'
    },
    heading5: {
        heading: 'Refunds:',
        desc1: 'Refunds are processed in 7–10 working days as per RBI guidelines, following item pickup and verification.',
        desc2: 'Prepaid orders : Refunded to original payment method.',
        desc3: 'COD orders : Refunded to UPI or bank account provided by you.',
        desc4: { 
            heading: 'LGD orders :' ,
            desc1: 'LGD products can only be exchanged for other LGD items. If a customer wishes to exchange an LGD item for a Demifine product, the total value of the selected Demifine items must be equal to or greater than the value of the LGD item. If the value is lower, the remaining balance will be issued as store credit, which can be redeemed at checkout.'
        }
    },
    heading6: {
        heading: 'Non-Refundable Items',
        desc1: 'Custom-made or personalized jewelry.',
        desc2: 'Goodbye or clearance products (as mentioned on product page)'
    },
    heading7: {
        heading: 'Exchange Policy - Within 10 Days',
        desc: 'If the exact item is not available, our team will assist you with the closest available variant or process a refund.'
    },
    heading8: {
        heading: 'Initiating a Exchange Request:',
        desc1: "1. Go to the Return/Exchange section on the Palmonas website or app menu, or follow this link :  https://returns.palmonas.com/login",
        desc2: "2. Enter your Palmonas Order ID and Contact Number. Ensure the Order ID is correctly entered, beginning with #PM1570.",
        desc3: "3. Choose the specific items from your order that you wish to exchange.",
        desc4: {
            subDescHead: "4. Provide Required Information :",
            subDesc: 'Specify an exchange reason.',
            subDesc2: 'Upload at least two images of the items.',
            subDesc3: 'Enter your pickup address and preferred date'
        },
        desc5: "Choose whether you want an exchange for the same item or for a different size/color.",
        desc6: 'Review all provided information and finalize your exchange request.'
    },
    heading9: {
        heading: 'Need Help?',
        desc: "For support, please visit 'https://support.palmonas.com/.We're always here to assist you."
    }
};


export {
    ShippingAndDeliveryPolicy,
    ReturnAndExchangePolicy,
    PaymentPolicy
}