# การตั้งค่า Environment Variables บน Vercel

## ปัญหา LINE Webhook 401 Unauthorized

ถ้าคุณเจอ error 401 เมื่อตั้งค่า LINE webhook ให้ทำตามขั้นตอนนี้:

## ขั้นตอนที่ 1: ตั้งค่า Environment Variables บน Vercel

1. เปิด [Vercel Dashboard](https://vercel.com/dashboard)
2. เลือกโปรเจค **data-center-ai-platform**
3. ไปที่ **Settings** > **Environment Variables**
4. เพิ่ม Variables ต่อไปนี้:

### LINE Messaging API (สำหรับ Chatbot)
```
LINE_CHANNEL_SECRET=your_channel_secret_here
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token_here
```

### LINE Notify (ถ้าใช้)
```
LINE_NOTIFY_TOKEN=your_notify_token_here
```

### ตัวอย่างการตั้งค่า:
- **Key**: `LINE_CHANNEL_SECRET`
- **Value**: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6` (ตัวอย่าง)
- **Environment**: เลือก **Production**, **Preview**, และ **Development** ทั้งหมด

## ขั้นตอนที่ 2: หา Channel Secret และ Access Token

1. เปิด [LINE Developers Console](https://developers.line.biz/console/)
2. เลือก Provider และ Channel ที่สร้างไว้
3. ไปที่แท็บ **Basic settings**:
   - คัดลอก **Channel secret**
4. ไปที่แท็บ **Messaging API**:
   - คัดลอก **Channel access token** (ถ้ายังไม่มี ให้กด **Issue**)

## ขั้นตอนที่ 3: ตั้งค่า Webhook URL บน LINE

1. ที่แท็บ **Messaging API**
2. หาส่วน **Webhook settings**
3. กด **Edit** ที่ Webhook URL
4. ใส่ URL: `https://data-center-ai-platform.vercel.app/api/line/webhook`
5. กด **Update**
6. กด **Verify** เพื่อทดสอบการเชื่อมต่อ
7. เปิด **Use webhook** (toggle เป็นสีเขียว)

## ขั้นตอนที่ 4: เปิดใช้งาน Bot Response

1. ที่แท็บ **Messaging API** 
2. หาส่วน **LINE Official Account features**
3. กดที่ **Edit** ข้าง Greeting message, Auto-reply, Webhooks
4. ตั้งค่าดังนี้:
   - **Auto-reply messages**: ปิด (Disabled)
   - **Greeting messages**: เปิดหรือปิดตามต้องการ
   - **Webhook**: เปิด (Enabled)

## ขั้นตอนที่ 5: Redeploy โปรเจค

หลังจากตั้งค่า Environment Variables แล้ว:

1. กลับไปที่ Vercel Dashboard
2. ไปที่แท็บ **Deployments**
3. คลิก **...** (จุดสามจุด) ที่ deployment ล่าสุด
4. เลือก **Redeploy**
5. เลือก **Use existing Build Cache** หรือไม่ก็ได้
6. กด **Redeploy**

## ขั้นตอนที่ 6: ทดสอบ Webhook

1. กลับไปที่ LINE Developers Console
2. ที่แท็บ **Messaging API** > **Webhook settings**
3. กด **Verify** อีกครั้ง
4. ถ้าขึ้น **Success** แสดงว่าใช้งานได้แล้ว

## ขั้นตอนที่ 7: ทดสอบ Bot

1. เปิดแอพ LINE บนมือถือ
2. สแกน QR Code จากหน้า **Messaging API** ของ LINE Developers Console
3. หรือเพิ่มเพื่อนผ่าน **Bot basic ID**
4. ส่งข้อความ "help" ไปที่ Bot
5. Bot ควรตอบกลับภายใน 1-2 วินาที

## คำสั่งทดสอบ Bot

- `help` - ดูคำสั่งทั้งหมด
- `status` - เช็คสถานะระบบ
- `temperature` - ดูอุณหภูมิ
- `alert` - ดู alerts ล่าสุด
- `servers` - สถานะเซิร์ฟเวอร์
- `power` - การใช้พลังงาน
- `predict` - คำทำนายจาก AI

## Troubleshooting

### ปัญหา: ยัง 401 Unauthorized อยู่

**วิธีแก้:**
1. ตรวจสอบว่า Environment Variables ตั้งค่าครบทั้ง 3 environments (Production, Preview, Development)
2. Redeploy โปรเจคใหม่อีกครั้ง
3. ลอง Verify webhook อีกครั้ง

### ปัญหา: Bot ไม่ตอบกลับ

**วิธีแก้:**
1. ตรวจสอบว่า **Use webhook** เปิดอยู่ (สีเขียว)
2. ตรวจสอบว่า **Auto-reply messages** ปิดอยู่
3. ดู Logs ใน Vercel Dashboard > Functions > Logs
4. ลองส่งข้อความใหม่อีกครั้ง

### ปัญหา: Channel Access Token หมดอายุ

**วิธีแก้:**
1. ไปที่ LINE Developers Console > Messaging API
2. ที่ส่วน **Channel access token (long-lived)** กด **Issue**
3. คัดลอก Token ใหม่
4. อัปเดต `LINE_CHANNEL_ACCESS_TOKEN` ใน Vercel
5. Redeploy โปรเจค

## ตรวจสอบ Logs

ดู logs แบบ real-time:
```bash
vercel logs data-center-ai-platform --follow
```

หรือดูใน Vercel Dashboard:
1. เปิดโ��รเจค
2. แท็บ **Functions**
3. เลือก `/api/line/webhook`
4. ดู **Logs** และ **Invocations**

## ตัวอย่าง Environment Variables ที่ถูกต้อง

```env
# LINE Messaging API
LINE_CHANNEL_SECRET=1234567890abcdef1234567890abcdef
LINE_CHANNEL_ACCESS_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# LINE Notify (optional)
LINE_NOTIFY_TOKEN=AbCdEfGhIjKlMnOpQrStUvWxYz1234567890

# Next.js
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
```

## หมายเหตุ

- Environment Variables จะมีผลหลัง Redeploy เท่านั้น
- ถ้าแก้ไข ENV ต้อง Redeploy ทุกครั้ง
- LINE Webhook ต้องใช้ HTTPS (HTTP ไม่ได้)
- Webhook URL ต้องตอบ status 200 ภายใน 3 วินาที

## ติดต่อสอบถาม

ถ้ายังมีปัญหา ให้เช็ค:
1. [LINE Messaging API Documentation](https://developers.line.biz/en/docs/messaging-api/)
2. [Vercel Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables)
