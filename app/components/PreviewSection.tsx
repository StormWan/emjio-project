'use client';

import React from 'react';
import { GeneratedEmoji } from '../types';
import styles from './PreviewSection.module.scss';

interface PreviewSectionProps {
    emojis: GeneratedEmoji[];
    bannerImage?: string;
    subjectDescription: string;
}

export default function PreviewSection({
    emojis,
    bannerImage,
    subjectDescription
}: PreviewSectionProps) {
    if (emojis.length === 0) {
        return null;
    }

    const downloadZip = async () => {
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();

        // 如果有banner图，添加到zip中
        if (bannerImage) {
            zip.file('专辑封面.png', bannerImage, { base64: true });
        }

        // 添加所有表情包
        emojis.forEach((emoji, index) => {
            const fileName = `${String(index + 1).padStart(2, '0')}_${emoji.keyword}.png`;
            // 处理base64数据
            const base64Data = emoji.imageData.startsWith('data:')
                ? emoji.imageData.split(',')[1]
                : emoji.imageData;
            zip.file(fileName, base64Data, { base64: true });
        });

        // 生成并下载
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${subjectDescription}_表情包.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className={styles.previewSection}>
            <h3>生成结果</h3>

            {bannerImage && (
                <div className={styles.bannerContainer}>
                    <h4>专辑封面</h4>
                    <div className={styles.bannerImage}>
                        <img
                            src={`data:image/png;base64,${bannerImage}`}
                            alt={`${subjectDescription} 专辑封面`}
                            className={styles.banner}
                        />
                    </div>
                </div>
            )}

            <div className={styles.emojiGrid}>
                {emojis.map((emoji) => (
                    <div key={emoji.id} className={styles.emojiItem}>
                        <img
                            src={emoji.imageData}
                            alt={emoji.keyword}
                            className={styles.emojiImage}
                        />
                        <span className={styles.keyword}>{emoji.keyword}</span>
                    </div>
                ))}
            </div>

            <div className={styles.downloadSection}>
                <button onClick={downloadZip} className={styles.downloadBtn}>
                    📦 下载表情包合集
                    {bannerImage && ' (含专辑封面)'}
                </button>
            </div>
        </div>
    );
} 