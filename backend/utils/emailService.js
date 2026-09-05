const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';

const brandColor = '#fb5607';

const baseTemplate = (title, content) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05)">
<tr><td style="background:${brandColor};padding:32px 40px;text-align:center">
<h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px">CRAYZEE.IN</h1>
</td></tr>
<tr><td style="padding:40px">
<h2 style="margin:0 0 24px;color:#18181b;font-size:20px;font-weight:700">${title}</h2>
${content}
</td></tr>
<tr><td style="padding:24px 40px;background:#fafafa;border-top:1px solid #f0f0f0;text-align:center">
<p style="margin:0;color:#a1a1aa;font-size:12px">© ${new Date().getFullYear()} Crayzee.in — All rights reserved</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
`;

const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;

const itemsTable = (items) => {
  const rows = items.map(item => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f0">
        <strong style="color:#18181b">${item.name}</strong>
        ${item.size ? `<br><span style="color:#a1a1aa;font-size:12px">Size: ${item.size}</span>` : ''}
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;text-align:center;color:#71717a">${item.qty}</td>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;color:#18181b">${formatPrice(item.price * item.qty)}</td>
    </tr>
  `).join('');

  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0">
    <thead><tr>
      <th style="padding:8px 0;text-align:left;color:#a1a1aa;font-size:11px;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #f0f0f0">Item</th>
      <th style="padding:8px 0;text-align:center;color:#a1a1aa;font-size:11px;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #f0f0f0">Qty</th>
      <th style="padding:8px 0;text-align:right;color:#a1a1aa;font-size:11px;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #f0f0f0">Amount</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  `;
};

exports.sendOrderConfirmationEmail = async (order, user) => {
  if (!user?.email) return;
  
  const addr = order.shippingAddress || {};
  const content = `
    <p style="color:#52525b;line-height:1.6;margin:0 0 16px">Hi <strong>${user.name || 'there'}</strong>, your order has been placed successfully!</p>
    <div style="background:#fafafa;border-radius:12px;padding:20px;margin:0 0 24px">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="color:#a1a1aa;font-size:12px;padding:4px 0">Order ID</td><td style="text-align:right;font-weight:700;color:#18181b;font-size:13px">#${String(order._id).slice(-8).toUpperCase()}</td></tr>
        <tr><td style="color:#a1a1aa;font-size:12px;padding:4px 0">Payment</td><td style="text-align:right;font-weight:600;color:#18181b;font-size:13px">${order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Paid Online'}</td></tr>
        <tr><td style="color:#a1a1aa;font-size:12px;padding:4px 0">Total</td><td style="text-align:right;font-weight:800;color:${brandColor};font-size:18px">${formatPrice(order.totalPrice)}</td></tr>
      </table>
    </div>
    ${itemsTable(order.orderItems)}
    <div style="background:#fafafa;border-radius:12px;padding:20px;margin:24px 0 0">
      <p style="margin:0 0 8px;color:#a1a1aa;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700">Shipping To</p>
      <p style="margin:0;color:#18181b;font-size:14px;line-height:1.6">
        ${addr.address || ''}<br>${addr.city || ''}, ${addr.postalCode || ''}<br>${addr.country || 'India'}
        ${addr.phone ? `<br>📞 ${addr.phone}` : ''}
      </p>
    </div>
  `;

  await resend.emails.send({
    from: emailFrom,
    to: user.email,
    subject: `Order Confirmed! #${String(order._id).slice(-8).toUpperCase()}`,
    html: baseTemplate('Order Confirmed! 🎉', content)
  });
};

exports.sendOrderShippedEmail = async (order, user) => {
  if (!user?.email) return;

  const content = `
    <p style="color:#52525b;line-height:1.6;margin:0 0 16px">Hi <strong>${user.name || 'there'}</strong>, great news! Your order has been shipped! 🚚</p>
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;margin:0 0 24px">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="color:#3b82f6;font-size:12px;font-weight:700;padding:4px 0">Tracking ID</td><td style="text-align:right;font-weight:700;color:#1e40af;font-size:14px">${order.trackingId || 'N/A'}</td></tr>
        <tr><td style="color:#3b82f6;font-size:12px;font-weight:700;padding:4px 0">Courier</td><td style="text-align:right;font-weight:600;color:#1e40af;font-size:13px">${order.courierName || 'N/A'}</td></tr>
        ${order.estimatedDelivery ? `<tr><td style="color:#3b82f6;font-size:12px;font-weight:700;padding:4px 0">Est. Delivery</td><td style="text-align:right;font-weight:600;color:#1e40af;font-size:13px">${order.estimatedDelivery}</td></tr>` : ''}
      </table>
    </div>
    <p style="color:#52525b;line-height:1.6;margin:0 0 16px">Order <strong>#${String(order._id).slice(-8).toUpperCase()}</strong> — ${formatPrice(order.totalPrice)}</p>
    ${itemsTable(order.orderItems)}
  `;

  await resend.emails.send({
    from: emailFrom,
    to: user.email,
    subject: `Order Shipped! 🚚 #${String(order._id).slice(-8).toUpperCase()}`,
    html: baseTemplate('Your Order is On Its Way!', content)
  });
};

exports.sendOrderDeliveredEmail = async (order, user) => {
  if (!user?.email) return;

  const content = `
    <p style="color:#52525b;line-height:1.6;margin:0 0 16px">Hi <strong>${user.name || 'there'}</strong>, your order has been delivered! 🎊</p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:0 0 24px">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="color:#16a34a;font-size:12px;font-weight:700;padding:4px 0">Order ID</td><td style="text-align:right;font-weight:700;color:#15803d;font-size:14px">#${String(order._id).slice(-8).toUpperCase()}</td></tr>
        <tr><td style="color:#16a34a;font-size:12px;font-weight:700;padding:4px 0">Total</td><td style="text-align:right;font-weight:800;color:#15803d;font-size:18px">${formatPrice(order.totalPrice)}</td></tr>
      </table>
    </div>
    <p style="color:#52525b;line-height:1.6;margin:0">We hope you love your purchase! If you have any issues, reply to this email or visit our website.</p>
  `;

  await resend.emails.send({
    from: emailFrom,
    to: user.email,
    subject: `Order Delivered! ✅ #${String(order._id).slice(-8).toUpperCase()}`,
    html: baseTemplate('Order Delivered! 🎊', content)
  });
};
