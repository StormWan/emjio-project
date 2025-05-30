import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { EMOJI_STYLES } from '../../constants/emojiStyles';
import { getEmotionDescription } from '../../constants/emotionMappings';

interface GeneratedEmoji {
    id: number;
    keyword: string;
    imageData: string;
}

export async function POST(request: NextRequest) {
    console.log('=== 使用的是 route.ts 文件 ===');

    try {
        const {
            subjectDescription,
            keywords,
            selectedStyle = 'cute-cartoon', // 默认值
            mode = 'album', // 默认值
            count = 16 // 默认值
        } = await request.json();

        console.log('接收到的参数:', { subjectDescription, keywords, selectedStyle, mode, count });

        // 保持原始的验证逻辑，但是适配新的模式
        if (!subjectDescription || !keywords) {
            return NextResponse.json(
                { error: '输入参数不完整' },
                { status: 400 }
            );
        }

        // 动态验证关键词数量，但保持宽松
        const expectedCount = mode === 'single' ? 1 : (mode === 'album' ? count : keywords.length);
        if (keywords.length === 0) {
            return NextResponse.json(
                { error: '请至少输入一个关键词' },
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

        // 获取风格配置，如果找不到就使用默认配置
        const styleConfig = EMOJI_STYLES.find(style => style.id === selectedStyle);
        const stylePrompt = styleConfig ? styleConfig.prompt : '卡通风格, Q萌可爱';

        const emojis: GeneratedEmoji[] = [];
        let sharedSeed: number = -1; // 用于专辑模式保持一致性

        // 为每个关键词生成表情包
        for (let i = 0; i < keywords.length; i++) {
            const keyword = keywords[i];

            // 获取详细的表情描述
            const emotionDescription = getEmotionDescription(keyword);

            // 按照即梦API建议优化prompt结构：风格+主体描述+美学+氛围
            let prompt;
            if (mode === 'album') {
                // 专辑模式：强调角色一致性
                prompt = `${stylePrompt}，${subjectDescription}，${emotionDescription}，同一个角色，保持角色外观完全一致，简洁纯色背景，高质量渲染，角色一致性，same character design，consistent style`;
            } else {
                // 单品模式：标准结构
                prompt = `${stylePrompt}，${subjectDescription}，${emotionDescription}，简洁纯色背景，高质量渲染，精细细节`;
            }

            try {
                console.log(`第${i + 1}张图片 关键词: ${keyword}`);
                console.log(`第${i + 1}张图片 表情描述: ${emotionDescription}`);
                console.log(`第${i + 1}张图片 完整Prompt: ${prompt}`);

                // 调用即梦AI生成图片，传入shared seed以保持一致性
                const result = await generateImageWithVolcAI(prompt, mode === 'album' ? sharedSeed : -1);

                // 如果是专辑模式的第一张图，保存seed
                if (mode === 'album' && sharedSeed === -1 && result.seed) {
                    sharedSeed = result.seed;
                }

                emojis.push({
                    id: i + 1,
                    keyword: keyword,
                    imageData: result.imageData,
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

        // 在生成完所有表情包后，如果是专辑模式，生成banner图
        if (mode === 'album' && emojis.length > 0) {
            try {
                console.log('开始生成专辑banner图...');

                // 生成banner图的prompt
                const bannerPrompt = `${stylePrompt}，${subjectDescription}，((没有字)),((没有字体)), 集合展示，多种表情状态组合，横版构图，宽屏比例，高质量渲染，精美设计，专辑封面风格`;

                console.log('Banner Prompt:', bannerPrompt);

                // 使用相同的seed确保风格一致
                const bannerResult = await generateBannerWithVolcAI(bannerPrompt, sharedSeed);

                if (bannerResult.imageData) {
                    console.log('Banner图生成成功');

                    return NextResponse.json({
                        emojis,
                        bannerImage: bannerResult.imageData, // 直接返回base64
                        seed: sharedSeed,
                        subjectDescription,
                        selectedStyle,
                        mode,
                        message: `成功生成${emojis.length}个表情包和专辑封面`
                    });
                }
            } catch (error) {
                console.error('Banner图生成失败:', error);
                // 即使banner生成失败，也返回表情包结果
            }
        }

        return NextResponse.json({
            emojis,
            seed: sharedSeed,
            subjectDescription,
            selectedStyle,
            mode,
            message: `成功生成${emojis.length}个表情包`
        });
    } catch (error) {
        console.error('生成表情包失败:', error);
        return NextResponse.json(
            { error: '服务器内部错误' },
            { status: 500 }
        );
    }
}

// 修改原始函数，支持seed参数
async function generateImageWithVolcAI(prompt: string, seed: number = -1): Promise<{ imageData: string, seed?: number }> {
    const accessKey = process.env.VOLC_ACCESS_KEY!;
    const secretKey = process.env.VOLC_SECRET_KEY!;
    const region = 'cn-north-1';
    const service = 'cv';
    const host = 'visual.volcengineapi.com';
    const endpoint = 'https://visual.volcengineapi.com';

    // 生成随机seed（如果没有传入）
    const actualSeed = seed === -1 ? Math.floor(Math.random() * 1000000) : seed;

    // 请求参数 - 保持您的原始参数
    const requestBody = {
        req_key: 'jimeng_high_aes_general_v21_L',
        prompt: prompt,
        width: 512,
        height: 512,
        scale: 7.5,
        seed: 1244122,// actualSeed, // 使用实际的seed
        use_pre_llm: false,
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
    // 处理响应 - 保持您的原始处理逻辑
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

            return {
                imageData: `data:image/png;base64,${base64}`,
                seed: actualSeed
            };
        }

        // 检查是否有base64数据
        if (result.data.binary_data_base64 && result.data.binary_data_base64.length > 0) {
            const base64Data = result.data.binary_data_base64[0];

            // 添加调试代码
            console.log('获取到base64数据');

            return {
                imageData: `data:image/png;base64,${base64Data}`,
                seed: actualSeed
            };
        }

        throw new Error('响应中没有找到图片数据');
    } else {
        console.error('即梦AI返回错误:', result);
        throw new Error(`即梦AI返回错误: ${result.message || '未知错误'}`);
    }
}

// 修复Banner生成函数 - 使用API支持的横版尺寸
async function generateBannerWithVolcAI(prompt: string, seed: number = -1): Promise<{ imageData: string, seed?: number }> {
    const accessKey = process.env.VOLC_ACCESS_KEY!;
    const secretKey = process.env.VOLC_SECRET_KEY!;

    const actualSeed = seed === -1 ? Math.floor(Math.random() * 1000000) : seed;

    const host = 'visual.volcengineapi.com';
    const region = 'cn-north-1';
    const service = 'cv';
    const endpoint = 'https://visual.volcengineapi.com';

    // 使用API支持的16:9横版尺寸
    const requestBody = {
        req_key: 'jimeng_high_aes_general_v21_L',
        prompt: prompt,
        width: 512,   // API支持的16:9横版
        height: 288,  // 16:9比例，完美的banner尺寸
        scale: 7.5,
        seed: actualSeed,
        use_pre_llm: false,
        ddim_steps: 25,
        return_url: true,
        use_sr: false,
        logo_info: {
            add_logo: false
        }
    };

    // 完全复用主函数的签名逻辑
    const bodyString = JSON.stringify(requestBody);
    const queryParams = {
        'Action': 'CVProcess',
        'Version': '2022-08-31'
    };

    const formatQuery = (parameters: Record<string, string>) => {
        let requestParameters = '';
        for (const key of Object.keys(parameters).sort()) {
            requestParameters += key + '=' + parameters[key] + '&';
        }
        return requestParameters.slice(0, -1);
    };

    const canonicalQuerystring = formatQuery(queryParams);
    const t = new Date();
    const currentDate = t.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const datestamp = currentDate.split('T')[0];
    const payloadHash = crypto.createHash('sha256').update(bodyString).digest('hex');

    const contentType = 'application/json';
    const canonicalHeaders =
        'content-type:' + contentType + '\n' +
        'host:' + host + '\n' +
        'x-content-sha256:' + payloadHash + '\n' +
        'x-date:' + currentDate + '\n';

    const signedHeaders = 'content-type;host;x-content-sha256;x-date';

    const canonicalRequest = [
        'POST',
        '/',
        canonicalQuerystring,
        canonicalHeaders,
        signedHeaders,
        payloadHash
    ].join('\n');

    const algorithm = 'HMAC-SHA256';
    const credentialScope = `${datestamp}/${region}/${service}/request`;
    const stringToSign = [
        algorithm,
        currentDate,
        credentialScope,
        crypto.createHash('sha256').update(canonicalRequest).digest('hex')
    ].join('\n');

    const sign = (key: Buffer | string, msg: string): Buffer => {
        return crypto.createHmac('sha256', key).update(msg).digest();
    };

    const kDate = sign(secretKey, datestamp);
    const kRegion = sign(kDate, region);
    const kService = sign(kRegion, service);
    const kSigning = sign(kService, 'request');
    const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

    const authorizationHeader = `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const headers = {
        'X-Date': currentDate,
        'Authorization': authorizationHeader,
        'X-Content-Sha256': payloadHash,
        'Content-Type': contentType,
        'Host': host
    };

    const requestUrl = `${endpoint}?${canonicalQuerystring}`;

    console.log('Banner生成请求参数:', {
        width: 512,
        height: 288,
        prompt: prompt.substring(0, 100) + '...',
        seed: actualSeed
    });

    const response = await fetch(requestUrl, {
        method: 'POST',
        headers: headers,
        body: bodyString
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Banner API Response:', errorText);
        throw new Error(`Banner生成失败: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Banner API Result Code:', result.code);

    if (result.code === 10000 && result.data) {
        if (result.data.image_urls && result.data.image_urls.length > 0) {
            const imageUrl = result.data.image_urls[0];
            console.log('Banner生成成功，URL方式');
            const imageResponse = await fetch(imageUrl);
            const imageBuffer = await imageResponse.arrayBuffer();
            const base64 = Buffer.from(imageBuffer).toString('base64');
            return { imageData: base64, seed: actualSeed };
        }

        if (result.data.binary_data_base64 && result.data.binary_data_base64.length > 0) {
            const base64Data = result.data.binary_data_base64[0];
            console.log('Banner生成成功，Base64方式');
            return { imageData: base64Data, seed: actualSeed };
        }

        throw new Error('Banner响应中没有找到图片数据');
    } else {
        throw new Error(`Banner生成失败: ${result.message || '未知错误'} (Code: ${result.code})`);
    }
}