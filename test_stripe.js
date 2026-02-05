require('dotenv').config({ path: '.env.local' });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createCheckoutSession(orderData, couponInfo) {
  // 1. 本地计算最终价格
  // 假设 orderData.amount = 10000, couponInfo.discount = 2000
  const finalAmount = orderData.amount - couponInfo.discount;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd', // 必须与本地币种一致
          unit_amount: finalAmount, // 核心：本地计算出的 8000 分
          product_data: {
            name: 'Premium Subscription Plan', // 这里的名字会显示在 Stripe 支付页
            description: `Original Price: $100.00 - Discount: $20.00`, // 在描述里手动写出优惠感
          },
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    // 3. 将本地优惠券 ID 存入 metadata，方便 Webhook 回调时核销
    metadata: {
      order_id: orderData.id,
      user_coupon_id: couponInfo.id,
      original_amount: '10000',
      applied_discount: '2000',
    },
    success_url: 'https://your-site.com/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://your-site.com/cancel',
  });

  return session.url;
}

async function main() {
  try {
    const url = await createCheckoutSession({
      id: 'order_123',
      amount: 10000,
    }, {
      id: 'coupon_123',
      discount: 2000,
    });

    process.stdout.write(`Checkout URL: ${url}\n`);
  } catch (error) {
    console.error('Error creating checkout session:', error.message);
  }
}

main();
