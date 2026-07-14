import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// ============================================================
// تهيئة Cloudinary
// ============================================================
cloudinary.config({
    cloud_name: 'dvxh9l4lv',
    api_key: '222419775879144',
    api_secret: 'GO3jNf_MgelRHHtr2cy_myYGnEE',
});

// ============================================================
// POST: رفع ملف إلى Cloudinary
// ============================================================
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const publicId = formData.get('publicId') as string || 'union_logo';

        // التحقق من وجود الملف
        if (!file) {
            return NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            );
        }

        // التحقق من حجم الملف (حد أقصى 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File size exceeds 5MB limit' },
                { status: 400 }
            );
        }

        // تحويل الملف إلى Buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // رفع الملف إلى Cloudinary
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: 'syndicate_system_logos',
                    public_id: publicId,
                    overwrite: true,
                    resource_type: 'auto',
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(buffer);
        });

        // إرجاع النتيجة
        return NextResponse.json({
            success: true,
            data: result,
        });

    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: error.message || 'Upload failed' },
            { status: 500 }
        );
    }
}

// ============================================================
// GET: التحقق من حالة الـ API
// ============================================================
export async function GET() {
    return NextResponse.json({
        success: true,
        message: 'Upload API is working',
        cloudinary: {
            cloud_name: 'dvxh9l4lv',
            folder: 'syndicate_system_logos',
        },
        timestamp: new Date().toISOString(),
    });
}

// ============================================================
// OPTIONS: التعامل مع CORS (اختياري)
// ============================================================
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
