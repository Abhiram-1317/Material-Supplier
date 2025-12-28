export default () => ({
  app: {
    port: parseInt(process.env.PORT ?? '3000', 10),
  },
  database: {
    url: process.env.DATABASE_URL ?? '',
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET ?? 'change-me',
  },
  payment: {
    provider: process.env.PAYMENT_PROVIDER ?? 'RAZORPAY',
    razorpayKeyId: process.env.RAZORPAY_KEY_ID ?? '',
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET ?? '',
    defaultCurrency: process.env.PAYMENT_CURRENCY ?? 'INR',
  },
  notifications: {
    enabled: process.env.NOTIFICATIONS_ENABLED === 'true',
    smsProvider: process.env.SMS_PROVIDER || 'TWILIO',
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
    twilioFromNumber: process.env.TWILIO_FROM_NUMBER || '',
  },
  twilioVerify: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    serviceSid: process.env.TWILIO_VERIFY_SERVICE_SID || '',
  },
  upi: {
    vpa: process.env.BUSINESS_UPI_VPA || '',
    name: process.env.BUSINESS_UPI_NAME || 'Business',
  },
  redis: {
    enabled: process.env.REDIS_ENABLED === 'true',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  queue: {
    enabled: process.env.QUEUE_ENABLED === 'true',
    redisHost: process.env.REDIS_HOST || 'localhost',
    redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
});
