'use client';
import React from 'react';
import { useState } from 'react';
import axios from 'axios';
import InputSection from './InputSection';
import PreviewSection from './PreviewSection';
import LoadingSpinner from './LoadingSpinner';
import { GeneratedEmoji } from '../types';
import styles from './EmojiGenerator.module.scss';

export default function EmojiGenerator() {
    const [subjectDescription, setSubjectDescription] = useState('');
    const [keywords, setKeywords] = useState<string[]>([]);
    const [selectedStyle, setSelectedStyle] = useState('cute-cartoon'); // 默认选择Q萌卡通风
    const [selectedMode, setSelectedMode] = useState('album'); // 默认表情专辑模式
    const [albumCount, setAlbumCount] = useState(16); // 默认16张
    const [generatedEmojis, setGeneratedEmojis] = useState<GeneratedEmoji[]>([]);
    const [bannerImage, setBannerImage] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // 根据模式初始化关键词数组
    React.useEffect(() => {
        if (selectedMode === 'single') {
            setKeywords(Array(1).fill(''));
        } else {
            setKeywords(Array(albumCount).fill(''));
        }
    }, [selectedMode, albumCount]);

    const handleGenerate = async () => {
        // 验证输入
        if (!subjectDescription.trim()) {
            setError('请输入表情包主体描述');
            return;
        }

        const validKeywords = keywords.filter(k => k.trim());
        const expectedCount = selectedMode === 'single' ? 1 : albumCount;

        if (validKeywords.length !== expectedCount) {
            setError(`请输入完整的${expectedCount}个关键词`);
            return;
        }

        if (!selectedStyle) {
            setError('请选择表情包风格');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await axios.post('/api/generate-emojis', {
                subjectDescription: subjectDescription.trim(),
                keywords: validKeywords,
                selectedStyle: selectedStyle,
                mode: selectedMode,
                count: selectedMode === 'single' ? 1 : albumCount
            });

            setGeneratedEmojis(response.data.emojis);
            setBannerImage(response.data.bannerImage || '');
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
                selectedStyle={selectedStyle}
                setSelectedStyle={setSelectedStyle}
                selectedMode={selectedMode}
                setSelectedMode={setSelectedMode}
                albumCount={albumCount}
                setAlbumCount={setAlbumCount}
                onGenerate={handleGenerate}
                isLoading={isLoading}
                error={error}
            />

            {isLoading && <LoadingSpinner />}

            {generatedEmojis.length > 0 && (
                <PreviewSection
                    emojis={generatedEmojis}
                    bannerImage={bannerImage}
                    subjectDescription={subjectDescription}
                />
            )}
        </div>
    );
} 