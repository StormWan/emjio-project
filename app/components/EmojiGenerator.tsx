'use client';
import React from 'react';
import { useState } from 'react';
import axios from 'axios';
import InputSection from './InputSection';
import PreviewSection from './PreviewSection';
import LoadingSpinner from './LoadingSpinner';
import styles from './EmojiGenerator.module.scss';

interface GeneratedEmoji {
    id: number;
    keyword: string;
    imageData: string; // base64 or URL
    processedImage?: string; // 处理后的图片
}

export default function EmojiGenerator() {
    const [subjectDescription, setSubjectDescription] = useState('');
    // const [keywords, setKeywords] = useState<string[]>(Array(16).fill(''));
    const [keywords, setKeywords] = useState<string[]>(Array(2).fill(''));
    const [generatedEmojis, setGeneratedEmojis] = useState<GeneratedEmoji[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        // 验证输入
        if (!subjectDescription.trim()) {
            setError('请输入表情包主体描述');
            return;
        }

        const validKeywords = keywords.filter(k => k.trim());
        if (validKeywords.length !== 2) {
            setError('请输入完整的16个关键词');
            return;
        }
        // if (validKeywords.length !== 16) {
        //     setError('请输入完整的16个关键词');
        //     return;
        // }

        setIsLoading(true);
        setError('');

        try {
            const response = await axios.post('/api/generate-emojis', {
                subjectDescription: subjectDescription.trim(),
                keywords: validKeywords
            });

            setGeneratedEmojis(response.data.emojis);
        } catch (err: any) {
            setError(err.response?.data?.error || '生成失败，请重试');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.generator}>
            <InputSection
                subjectDescription={subjectDescription}
                setSubjectDescription={setSubjectDescription}
                keywords={keywords}
                setKeywords={setKeywords}
                onGenerate={handleGenerate}
                isLoading={isLoading}
                error={error}
            />

            {isLoading && <LoadingSpinner />}

            {generatedEmojis.length > 0 && (
                <PreviewSection
                    emojis={generatedEmojis}
                    subjectDescription={subjectDescription}
                />
            )}
        </div>
    );
} 