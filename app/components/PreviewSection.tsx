'use client';


import { useEffect, useState } from 'react';
import JSZip from 'jszip';
import styles from './PreviewSection.module.scss';
import React from 'react';

interface Emoji {
    id: number;
    keyword: string;
    imageData: string;
}

interface PreviewSectionProps {
    emojis: Emoji[];
    subjectDescription: string;
}

export default function PreviewSection({ emojis, subjectDescription }: PreviewSectionProps) {
    const [processedEmojis, setProcessedEmojis] = useState<any[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        processImages();
    }, [emojis]);

    const processImages = async () => {
        setIsProcessing(true);
        const processed = [];

        for (const emoji of emojis) {
            try {
                const processedData = await processImage(emoji.imageData, emoji.keyword);
                processed.push({
                    ...emoji,
                    mainImage: processedData.mainImage,
                    thumbImage: processedData.thumbImage,
                    iconImage: processedData.iconImage,
                });
            } catch (error) {
                console.error('处理图片失败:', error);
            }
        }

        setProcessedEmojis(processed);
        setIsProcessing(false);
    };

    const processImage = async (imageData: string, keyword: string) => {
        return new Promise<any>((resolve) => {
            const img = new Image();
            img.onload = () => {
                // 创建主图 (240x240)
                const mainCanvas = createCanvas(240, 240);
                const mainCtx = mainCanvas.getContext('2d')!;

                // 绘制图片
                mainCtx.drawImage(img, 0, 0, 240, 240);

                // 添加文字
                addTextToCanvas(mainCtx, keyword, 240, 240);

                // 添加水印
                addWatermark(mainCtx, 240, 240);

                // 创建缩略图 (120x120)
                const thumbCanvas = createCanvas(120, 120);
                const thumbCtx = thumbCanvas.getContext('2d')!;
                thumbCtx.drawImage(mainCanvas, 0, 0, 120, 120);

                // 创建图标 (50x50)
                const iconCanvas = createCanvas(50, 50);
                const iconCtx = iconCanvas.getContext('2d')!;
                iconCtx.drawImage(mainCanvas, 0, 0, 50, 50);

                // 添加边框
                addBorderToCanvas(iconCtx, 50, 50);

                resolve({
                    mainImage: mainCanvas.toDataURL('image/png'),
                    thumbImage: thumbCanvas.toDataURL('image/png'),
                    iconImage: iconCanvas.toDataURL('image/png'),
                });
            };
            img.src = imageData;
        });
    };

    const createCanvas = (width: number, height: number) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    };

    const addTextToCanvas = (ctx: CanvasRenderingContext2D, text: string, width: number, height: number) => {
        const fontSize = Math.max(12, width * 0.08);
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        const x = width / 2;
        const y = height - 10;

        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);
    };

    const addWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.font = '10px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText('AI生成', width - 5, height - 5);
    };

    const addBorderToCanvas = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, width - 2, height - 2);
    };

    const createBanner = async () => {
        const canvas = createCanvas(750, 400);
        const ctx = canvas.getContext('2d')!;

        // 背景渐变
        const gradient = ctx.createLinearGradient(0, 0, 750, 400);
        gradient.addColorStop(0, '#4facfe');
        gradient.addColorStop(1, '#00f2fe');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 750, 400);

        // 绘制前3张表情包
        if (processedEmojis.length >= 3) {
            for (let i = 0; i < 3; i++) {
                const img = new Image();
                img.src = processedEmojis[i].mainImage;
                await new Promise(resolve => {
                    img.onload = () => {
                        ctx.drawImage(img, 50 + i * 200, 100, 150, 150);
                        resolve(null);
                    };
                });
            }
        }

        // 添加标题
        ctx.font = 'bold 36px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText('AI生成表情包', 375, 350);

        return canvas.toDataURL('image/png');
    };

    const downloadZip = async () => {
        if (processedEmojis.length === 0) return;

        const zip = new JSZip();

        // 创建文件夹
        const mainFolder = zip.folder('main');
        const thumbFolder = zip.folder('thumb');
        const iconFolder = zip.folder('icon');

        // 添加主图
        processedEmojis.forEach((emoji, index) => {
            const fileName = String(index + 1).padStart(2, '0');

            mainFolder?.file(`${fileName}.png`, emoji.mainImage.split(',')[1], { base64: true });
            thumbFolder?.file(`${fileName}-thumb.png`, emoji.thumbImage.split(',')[1], { base64: true });
            iconFolder?.file(`${fileName}-icon.png`, emoji.iconImage.split(',')[1], { base64: true });
        });

        // 创建横幅
        const bannerData = await createBanner();
        zip.file('banner.png', bannerData.split(',')[1], { base64: true });

        // 生成并下载ZIP
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ai-emoji-pack.zip';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className={styles.previewSection}>
            <h2>表情包预览</h2>

            {isProcessing ? (
                <div className={styles.processing}>正在处理图片...</div>
            ) : (
                <>
                    <div className={styles.emojiGrid}>
                        {processedEmojis.map((emoji) => (
                            <div key={emoji.id} className={styles.emojiItem}>
                                <img src={emoji.mainImage} alt={emoji.keyword} />
                                <span>{emoji.keyword}</span>
                            </div>
                        ))}
                    </div>

                    <button onClick={downloadZip} className={styles.downloadButton}>
                        下载表情包 ZIP
                    </button>
                </>
            )}
        </div>
    );
} 