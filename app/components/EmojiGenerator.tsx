'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InputSection from './InputSection';
import PreviewSection from './PreviewSection';
import LoadingSpinner from './LoadingSpinner';
import StepProgress from './StepProgress';
import { GeneratedEmoji } from '../types';
import styles from './EmojiGenerator.module.scss';

const GENERATION_STEPS = [
    { id: 'mode', title: '选择模式', description: '选择生成单个表情包还是表情包专辑' },
    { id: 'subject', title: '描述主体', description: '详细描述表情包的主角形象' },
    { id: 'style', title: '选择风格', description: '选择表情包的艺术风格' },
    { id: 'keywords', title: '添加关键词', description: '为每个表情添加情绪或动作描述' }
];

export default function EmojiGenerator() {
    const [currentStep, setCurrentStep] = useState(0);
    const [subjectDescription, setSubjectDescription] = useState('');
    const [keywords, setKeywords] = useState<string[]>([]);
    const [selectedStyle, setSelectedStyle] = useState('cute-cartoon');
    const [selectedMode, setSelectedMode] = useState('album');
    const [albumCount, setAlbumCount] = useState(16);
    const [generatedEmojis, setGeneratedEmojis] = useState<GeneratedEmoji[]>([]);
    const [bannerImage, setBannerImage] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [loadingMessage, setLoadingMessage] = useState('');

    // 根据模式初始化关键词数组
    useEffect(() => {
        if (selectedMode === 'single') {
            setKeywords(Array(1).fill(''));
            setAlbumCount(1);
        } else {
            setKeywords(Array(albumCount).fill(''));
        }
    }, [selectedMode, albumCount]);

    // 重置到第一步
    const resetToStart = () => {
        setCurrentStep(0);
        setGeneratedEmojis([]);
        setBannerImage('');
        setError('');
    };

    const validateStep = (stepIndex: number) => {
        switch (stepIndex) {
            case 0: // 选择模式
                return true;
            case 1: // 描述主体
                return subjectDescription.trim().length > 0;
            case 2: // 选择风格
                return selectedStyle !== '';
            case 3: // 添加关键词
                const validKeywords = keywords.filter(k => k.trim());
                const expectedCount = selectedMode === 'single' ? 1 : albumCount;
                return validKeywords.length === expectedCount;
            default:
                return false;
        }
    };

    const canProceedToNext = () => {
        return validateStep(currentStep);
    };

    const canProceedToPrev = () => {
        return currentStep > 0;
    };

    // 检查是否所有步骤都已完成
    const allStepsCompleted = () => {
        return GENERATION_STEPS.every((_, index) => validateStep(index));
    };

    const handleNextStep = () => {
        if (canProceedToNext()) {
            setError('');
            if (currentStep < GENERATION_STEPS.length - 1) {
                setCurrentStep(prev => prev + 1);
            }
        } else {
            // 显示当前步骤的错误提示
            switch (currentStep) {
                case 1:
                    setError('请输入表情包主体描述');
                    break;
                case 2:
                    setError('请选择表情包风格');
                    break;
                case 3:
                    const expectedCount = selectedMode === 'single' ? 1 : albumCount;
                    setError(`请输入完整的${expectedCount}个关键词`);
                    break;
            }
        }
    };

    const handlePrevStep = () => {
        if (canProceedToPrev()) {
            setCurrentStep(prev => prev - 1);
            setError('');
        }
    };

    const handleGenerate = async () => {
        if (!allStepsCompleted()) {
            setError('请完成所有步骤后再生成表情包');
            return;
        }

        setIsLoading(true);
        setError('');
        setLoadingMessage('AI正在理解你的创意需求...');

        try {
            setTimeout(() => setLoadingMessage('正在绘制表情包主体形象...'), 2000);
            setTimeout(() => setLoadingMessage('正在添加表情和动作效果...'), 4000);
            setTimeout(() => setLoadingMessage('正在进行最终优化处理...'), 6000);

            const response = await axios.post('/api/generate-emojis', {
                subjectDescription: subjectDescription.trim(),
                keywords: keywords.filter(k => k.trim()),
                selectedStyle,
                mode: selectedMode,
                count: selectedMode === 'single' ? 1 : albumCount
            });

            setGeneratedEmojis(response.data.emojis);
            setBannerImage(response.data.bannerImage || '');
        } catch (err: any) {
            setError(err.response?.data?.error || '生成失败，请重试');
            setGeneratedEmojis([]);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    // 如果已生成表情包，显示结果页面
    if (generatedEmojis.length > 0) {
        return (
            <div className={styles.emojiGenerator}>
                <PreviewSection
                    emojis={generatedEmojis}
                    bannerImage={bannerImage}
                    subjectDescription={subjectDescription}
                />
                <div className={styles.actions}>
                    <button 
                        onClick={resetToStart}
                        className={`${styles.btn} ${styles.btnSecondary}`}
                    >
                        重新创作
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.emojiGenerator}>
            <StepProgress
                currentStep={currentStep}
                totalSteps={GENERATION_STEPS.length}
                stepTitle={GENERATION_STEPS[currentStep].title}
            />
            
            <div className={styles.stepContainer}>
                <button
                    onClick={handlePrevStep}
                    disabled={!canProceedToPrev()}
                    className={styles.navButton}
                    title="上一步"
                >
                    ←
                </button>
                
                <div className={styles.stepContent}>
                    <div className={styles.stepHeader}>
                        <h2>{GENERATION_STEPS[currentStep].title}</h2>
                        <p>{GENERATION_STEPS[currentStep].description}</p>
                    </div>
                    
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
                        currentStep={currentStep}
                    />
                </div>
                
                <button
                    onClick={handleNextStep}
                    disabled={!canProceedToNext() || currentStep >= GENERATION_STEPS.length - 1}
                    className={styles.navButton}
                    title="下一步"
                >
                    →
                </button>
            </div>

            {allStepsCompleted() && (
                <div className={styles.generateSection}>
                    <button
                        onClick={handleGenerate}
                        className={styles.generateButton}
                        disabled={isLoading}
                    >
                        🎨 一键生成表情包
                    </button>
                </div>
            )}

            {isLoading && <LoadingSpinner message={loadingMessage} />}
        </div>
    );
} 