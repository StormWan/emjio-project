'use client';

import React, { useState } from 'react';
import JSZip from 'jszip';
import styles from './PreviewSection.module.scss';
import { GeneratedEmoji } from '../types';

interface PreviewSectionProps {
    emojis: GeneratedEmoji[];
    bannerImage: string;
    subjectDescription: string;
}

export default function PreviewSection({
    emojis,
    bannerImage,
    subjectDescription
}: PreviewSectionProps) {
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [fileName, setFileName] = useState(`${subjectDescription}_表情包`);
    const [showFileNameModal, setShowFileNameModal] = useState(false);

    if (emojis.length === 0) {
        return null;
    }

    const handleImageClick = (imageData: string) => {
        setPreviewImage(imageData);
    };

    const handleClosePreview = () => {
        setPreviewImage(null);
    };

    const downloadZip = async () => {
        setShowFileNameModal(true);
    };

    const handleDownload = async () => {
        const zip = new JSZip();

        // 如果有banner图，添加到zip中
        if (bannerImage) {
            const base64Data = bannerImage.startsWith('data:') 
                ? bannerImage.split(',')[1] 
                : bannerImage;
            zip.file('专辑封面.png', base64Data, { base64: true });
        }

        // 添加所有表情包
        emojis.forEach((emoji, index) => {
            const emojiFileName = `${String(index + 1).padStart(2, '0')}_${emoji.keyword}.png`;
            const base64Data = emoji.imageData.startsWith('data:')
                ? emoji.imageData.split(',')[1]
                : emoji.imageData;
            zip.file(emojiFileName, base64Data, { base64: true });
        });

        // 生成并下载
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setShowFileNameModal(false);
    };

    return (
        <div className={styles.previewSection}>
            <h3>生成结果</h3>

            {bannerImage && (
                <div className={styles.bannerContainer}>
                    <h4>专辑封面</h4>
                    <div className={styles.bannerImage}>
                        <img
                            src={bannerImage}
                            alt={`${subjectDescription} 专辑封面`}
                            onClick={() => handleImageClick(bannerImage)}
                        />
                    </div>
                </div>
            )}

            <div className={styles.emojiGrid}>
                {emojis.map((emoji) => (
                    <div 
                        key={emoji.id} 
                        className={styles.emojiItem}
                        onClick={() => handleImageClick(emoji.imageData)}
                    >
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

            {previewImage && (
                <div className={styles.imagePreviewModal} onClick={handleClosePreview}>
                    <img src={previewImage} alt="预览图片" onClick={(e) => e.stopPropagation()} />
                </div>
            )}

            {showFileNameModal && (
                <div className={styles.modal}>
                    <div className={styles.modalOverlay} onClick={() => setShowFileNameModal(false)} />
                    <div className={styles.modalContent}>
                        <h4>设置文件名</h4>
                        <div className={styles.formGroup}>
                            <input
                                type="text"
                                value={fileName}
                                onChange={(e) => setFileName(e.target.value)}
                                placeholder="输入文件名"
                            />
                        </div>
                        <div className={styles.modalActions}>
                            <button 
                                className={`${styles.btn} ${styles.btnSecondary}`}
                                onClick={() => setShowFileNameModal(false)}
                            >
                                取消
                            </button>
                            <button 
                                className={`${styles.btn} ${styles.btnPrimary}`}
                                onClick={handleDownload}
                            >
                                确认下载
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 