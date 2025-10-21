# Gemini AI Setup Guide

## Environment Variables

Tạo file `.env.local` trong root directory với nội dung:

```bash
# Gemini AI API Key
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

## Lấy API Key

1. Truy cập [Google AI Studio](https://aistudio.google.com/)
2. Đăng nhập với Google account
3. Tạo API key mới
4. Copy key và paste vào `.env.local`

## Test API

Sau khi set API key, test bằng cách:
1. Upload ảnh chính trong form đăng ký sản phẩm
2. Click "AI 이미지 생성" button
3. Kiểm tra console logs để debug

## Debug Logs

API sẽ log các thông tin sau:
- 🤖 AI Generate Image API called
- 📝 Request data
- ✅ API key found
- 🎨 Generating single image...
- 🎨 Generation result
