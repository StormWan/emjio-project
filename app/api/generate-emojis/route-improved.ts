import { NextRequest, NextResponse } from 'next/server';
import { Signer } from '@volcengine/openapi';
import { createCanvas } from 'canvas';

interface RequestObj {
    region: string;
    method: string;
    params?: Record<string, any>;
    headers: Record<string, string>;
    body?: string;
}

interface Credentials {
    accessKeyId: string;
    secretKey: string;
    sessionToken?: string;
}

export async function POST(request: NextRequest) {
    console.log('=== 使用的是 route-improved.ts 文件 ===');

    try {
        const { subjectDescription, keywords } = await request.json();

        // 验证输入
        if (!subjectDescription || !keywords || keywords.length !== 16) {
            return NextResponse.json(
                { error: '输入参数不完整' },
                { status: 400 }
            );
        }

        // 验证环境变量
        if (!process.env.VOLC_ACCESS_KEY || !process.env.VOLC_SECRET_KEY) {
            return NextResponse.json(
                { error: '服务器配置错误：缺少API密钥' },
                { status: 500 }
            );
        }

        const credentials: Credentials = {
            accessKeyId: process.env.VOLC_ACCESS_KEY,
            secretKey: process.env.VOLC_SECRET_KEY,
            sessionToken: "",
        };

        const emojis = [];

        // 为每个关键词生成表情包
        for (let i = 0; i < keywords.length; i++) {
            const keyword = keywords[i];
            const prompt = `${subjectDescription}, ${keyword}, 表情包风格, 简洁背景, 高质量, 卡通风格`;

            try {
                // 调用即梦AI生成图片
                const imageData = await generateImageWithVolcAI(prompt, credentials);

                emojis.push({
                    id: i + 1,
                    keyword: keyword,
                    imageData: imageData,
                });

                // 添加延迟避免API限制
                await new Promise(resolve => setTimeout(resolve, 200));
            } catch (error) {
                console.error(`生成第${i + 1}张图片失败:`, error);

                // 如果单张图片生成失败，使用占位图片
                emojis.push({
                    id: i + 1,
                    keyword: keyword,
                    imageData: generatePlaceholderImage(keyword),
                });
            }
        }

        return NextResponse.json({ emojis });
    } catch (error) {
        console.error('生成表情包失败:', error);
        return NextResponse.json(
            { error: '服务器内部错误' },
            { status: 500 }
        );
    }
}

async function generateImageWithVolcAI(prompt: string, credentials: Credentials): Promise<string> {
    // 构建请求数据
    const requestData: RequestObj = {
        region: 'cn-north-1',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Service': 'cv',
            'Region': 'cn-north-1',
        },
        params: {
            Action: "CVProcess",
            Version: "2022-08-31",
            // RoleTrn: "trn:iam::200:role/STSRole",
            // RoleSessionName: "test",
        },
        body: JSON.stringify({
            req_key: `jimeng_high_aes_general_v21_L`,
            prompt: prompt,
            // model_version: "general_v1.4", // 根据即梦AI文档调整
            // width: 240,
            // height: 240,
            // scale: 7.5,
            // seed: -1,
            // ddim_steps: 25,
            // return_url: true,
        }),
    };

    // 创建签名器
    const signer = new Signer(requestData, "visual");

    // 添加授权签名
    signer.addAuthorization(credentials);

    console.log('requestData: ', requestData)

    // 发送请求到即梦AI
    const response = await fetch('https://visual.volcengineapi.com', {
        method: requestData.method,
        headers: requestData.headers,
        body: requestData.body,
    });

    if (!response.ok) {
        throw new Error(`即梦AI API请求失败: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    // 根据即梦AI的响应格式调整
    if (result.data && result.data.image_url) {
        // 如果返回的是URL，需要下载图片并转换为base64
        const imageResponse = await fetch(result.data.image_url);
        const imageBuffer = await imageResponse.arrayBuffer();
        const base64 = Buffer.from(imageBuffer).toString('base64');
        return `data:image/png;base64,${base64}`;
    } else if (result.data && result.data.image_base64) {
        // 如果直接返回base64
        return `data:image/png;base64,${result.data.image_base64}`;
    } else {
        throw new Error('即梦AI返回格式异常');
    }
}

function generatePlaceholderImage(keyword: string): string {
    // 使用node-canvas生成占位图片
    const canvas = createCanvas(240, 240);
    const ctx = canvas.getContext('2d');

    // 根据关键词生成颜色
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    const colorIndex = keyword.length % colors.length;

    ctx.fillStyle = colors[colorIndex];
    ctx.fillRect(0, 0, 240, 240);

    // 添加文字
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(keyword, 120, 120);

    return canvas.toDataURL('image/png');
} 