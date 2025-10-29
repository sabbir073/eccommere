import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@ecommerce.com',
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
}

export async function sendOrderConfirmation(order: any) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0ea5e9; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .order-details { background-color: white; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmation</h1>
        </div>
        <div class="content">
          <p>Dear ${order.shipping_name},</p>
          <p>Thank you for your order! Your order has been received and is being processed.</p>

          <div class="order-details">
            <h2>Order Details</h2>
            <p><strong>Order Number:</strong> ${order.order_number}</p>
            <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> ৳${order.total}</p>
            <p><strong>Payment Method:</strong> Cash on Delivery</p>
          </div>

          <div class="order-details">
            <h2>Shipping Address</h2>
            <p>${order.shipping_name}</p>
            <p>${order.shipping_phone}</p>
            <p>${order.shipping_address_line1}</p>
            ${order.shipping_address_line2 ? `<p>${order.shipping_address_line2}</p>` : ''}
            <p>${order.shipping_city}, ${order.shipping_postal_code}</p>
          </div>

          <p>We'll send you another email when your order ships.</p>
        </div>
        <div class="footer">
          <p>Thank you for shopping with us!</p>
          <p>&copy; ${new Date().getFullYear()} Your E-Commerce Store. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: order.shipping_email || order.guest_email,
    subject: `Order Confirmation - ${order.order_number}`,
    html,
  });
}

export async function sendWelcomeEmail(user: { email: string; first_name: string }) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0ea5e9; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .button { display: inline-block; padding: 10px 20px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Our Store!</h1>
        </div>
        <div class="content">
          <p>Hi ${user.first_name},</p>
          <p>Welcome to our e-commerce platform! We're excited to have you as a member.</p>
          <p>You can now:</p>
          <ul>
            <li>Browse our wide selection of products</li>
            <li>Save items to your wishlist</li>
            <li>Track your orders</li>
            <li>Manage your account and addresses</li>
          </ul>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}" class="button">Start Shopping</a>
          <p>If you have any questions, feel free to contact us.</p>
          <p>Happy shopping!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Welcome to Our E-Commerce Store!',
    html,
  });
}
