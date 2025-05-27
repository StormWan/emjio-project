import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

interface GeneratedEmoji {
    id: number;
    keyword: string;
    imageData: string;
}

export async function POST(request: NextRequest) {
    console.log('=== 使用的是 route.ts 文件 ===');

    try {
        const { subjectDescription, keywords } = await request.json();

        // 验证输入
        // if (!subjectDescription || !keywords || keywords.length !== 16) {
        if (!subjectDescription || !keywords || keywords.length !== 2) {
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

        const emojis: GeneratedEmoji[] = [];

        // 为每个关键词生成表情包
        for (let i = 0; i < keywords.length; i++) {
            const keyword = keywords[i];
            const prompt = `${subjectDescription}, ${keyword}, 表情包风格, 简洁背景, 高质量, 卡通风格`;

            try {
                // 调用即梦AI生成图片
                const imageData = await generateImageWithVolcAI(prompt);

                emojis.push({
                    id: i + 1,
                    keyword: keyword,
                    imageData: imageData,
                });

                // 添加延迟避免API限制
                await new Promise(resolve => setTimeout(resolve, 1000));
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

async function generateImageWithVolcAI(prompt: string): Promise<string> {
    const accessKey = process.env.VOLC_ACCESS_KEY!;
    const secretKey = process.env.VOLC_SECRET_KEY!;
    const region = 'cn-north-1';
    const service = 'cv';
    const host = 'visual.volcengineapi.com';
    const endpoint = 'https://visual.volcengineapi.com';

    // 请求参数
    const requestBody = {
        req_key: 'jimeng_high_aes_general_v21_L',
        prompt: prompt,
        width: 512,
        height: 512,
        scale: 7.5,
        seed: -1,
        ddim_steps: 25,
        return_url: true,
        use_sr: false,
        logo_info: {
            add_logo: false
        }
    };

    const bodyString = JSON.stringify(requestBody);

    // 构建查询参数
    const queryParams = {
        'Action': 'CVProcess',
        'Version': '2022-08-31'
    };

    // 格式化查询字符串
    const formatQuery = (parameters: Record<string, string>) => {
        let requestParameters = '';
        for (const key of Object.keys(parameters).sort()) {
            requestParameters += key + '=' + parameters[key] + '&';
        }
        return requestParameters.slice(0, -1);
    };

    const canonicalQuerystring = formatQuery(queryParams);

    // 生成时间戳
    const t = new Date();
    const currentDate = t.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const datestamp = currentDate.split('T')[0];

    // 计算payload hash
    const payloadHash = crypto.createHash('sha256').update(bodyString).digest('hex');

    // 构建canonical headers
    const contentType = 'application/json';
    const canonicalHeaders =
        'content-type:' + contentType + '\n' +
        'host:' + host + '\n' +
        'x-content-sha256:' + payloadHash + '\n' +
        'x-date:' + currentDate + '\n';

    const signedHeaders = 'content-type;host;x-content-sha256;x-date';

    // 创建canonical request
    const canonicalRequest = [
        'POST',
        '/',
        canonicalQuerystring,
        canonicalHeaders,
        signedHeaders,
        payloadHash
    ].join('\n');

    // 创建string to sign
    const algorithm = 'HMAC-SHA256';
    const credentialScope = `${datestamp}/${region}/${service}/request`;
    const stringToSign = [
        algorithm,
        currentDate,
        credentialScope,
        crypto.createHash('sha256').update(canonicalRequest).digest('hex')
    ].join('\n');

    // 计算签名
    const sign = (key: Buffer | string, msg: string): Buffer => {
        return crypto.createHmac('sha256', key).update(msg).digest();
    };

    const kDate = sign(secretKey, datestamp);
    const kRegion = sign(kDate, region);
    const kService = sign(kRegion, service);
    const kSigning = sign(kService, 'request');
    const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

    // 构建Authorization头
    const authorizationHeader = `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    // 构建请求头
    const headers = {
        'X-Date': currentDate,
        'Authorization': authorizationHeader,
        'X-Content-Sha256': payloadHash,
        'Content-Type': contentType,
        'Host': host
    };

    // 发送请求
    const requestUrl = `${endpoint}?${canonicalQuerystring}`;

    const response = await fetch(requestUrl, {
        method: 'POST',
        headers: headers,
        body: bodyString
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('即梦AI API错误响应:', errorText);
        throw new Error(`即梦AI API请求失败: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('即梦AI响应:', result);

    console.log('---------------------------------------', result.code === 10000 && result.data)
    // 处理响应 - 根据实际返回格式调整
    if (result.code === 10000 && result.data) {
        // 检查是否有图片URL
        if (result.data.image_urls && result.data.image_urls.length > 0) {
            const imageUrl = result.data.image_urls[0];
            console.log('获取到图片URL:', imageUrl);

            // 添加调试代码
            console.log('开始下载图片...');

            // 下载图片并转换为base64
            const imageResponse = await fetch(imageUrl);
            if (!imageResponse.ok) {
                throw new Error(`下载图片失败: ${imageResponse.status}`);
            }

            const imageBuffer = await imageResponse.arrayBuffer();
            const base64 = Buffer.from(imageBuffer).toString('base64');

            // 添加调试代码
            console.log('图片下载完成');

            return `data:image/png;base64,${base64}`;
        }

        // 检查是否有base64数据
        if (result.data.binary_data_base64 && result.data.binary_data_base64.length > 0) {
            const base64Data = result.data.binary_data_base64[0];

            // 添加调试代码
            console.log('获取到base64数据');

            return `data:image/png;base64,${base64Data}`;
        }

        throw new Error('响应中没有找到图片数据');
    } else {
        console.error('即梦AI返回错误:', result);
        throw new Error(`即梦AI返回错误: ${result.message || '未知错误'}`);
    }
}

function generatePlaceholderImage(keyword: string): string {
    // 生成SVG格式的占位图片
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    const colorIndex = keyword.length % colors.length;
    const color = colors[colorIndex];

    const svg = `
        <svg width="240" height="240" xmlns="http://www.w3.org/2000/svg">
            <rect width="240" height="240" fill="${color}"/>
            <text x="120" y="120" font-family="Arial, sans-serif" font-size="24" font-weight="bold" 
                    text-anchor="middle" dominant-baseline="middle" fill="white">${keyword}</text>
        </svg>
    `;

    const base64 = Buffer.from(svg).toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
} 