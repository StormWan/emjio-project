'use client';

import { Dispatch, SetStateAction, useState } from 'react';
import ModeSelector from './ModeSelector';
import StyleSelector from './StyleSelector';
import InspirationModal from './InspirationModal';
import { getRandomKeywords } from '../constants/popularKeywords';
import styles from './InputSection.module.scss';
import React from 'react';

export interface InputSectionProps {
    subjectDescription: string;
    setSubjectDescription: (value: string) => void;
    keywords: string[];
    setKeywords: (value: string[]) => void;
    selectedStyle: string;
    setSelectedStyle: (value: string) => void;
    selectedMode: string;
    setSelectedMode: (value: string) => void;
    albumCount: number;
    setAlbumCount: (value: number) => void;
    onGenerate: () => void;
    isLoading: boolean;
    error?: string;
    currentStep: number;
}

export default function InputSection({
    subjectDescription,
    setSubjectDescription,
    keywords,
    setKeywords,
    selectedStyle,
    setSelectedStyle,
    selectedMode,
    setSelectedMode,
    albumCount,
    setAlbumCount,
    onGenerate,
    isLoading,
    error,
    currentStep
}: InputSectionProps) {
    const [isInspirationModalOpen, setIsInspirationModalOpen] = useState(false);

    const handleKeywordChange = (index: number, value: string) => {
        const newKeywords = [...keywords];
        newKeywords[index] = value;
        setKeywords(newKeywords);
    };

    const fillRandomKeywords = () => {
        const emotions = ['开心', '生气', '悲伤', '惊讶', '疑惑', '害羞', '得意', '无语',
            '期待', '委屈', '困倦', '兴奋', '害怕', '尴尬', '思考', '大笑'];
        const shuffled = emotions.sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, selectedMode === 'single' ? 1 : albumCount);
        setKeywords(selected);
    };

    const handleInspirationSelect = (suggestion: string) => {
        setSubjectDescription(suggestion);
    };

    const currentKeywordCount = selectedMode === 'single' ? 1 : albumCount;

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: // 选择模式
                return (
                    <ModeSelector
                        selectedMode={selectedMode}
                        onModeChange={setSelectedMode}
                        albumCount={albumCount}
                        onAlbumCountChange={setAlbumCount}
                    />
                );
            case 1: // 描述主体
                return (
                    <div className={styles.subjectInput}>
                        <div className={styles.subjectHeader}>
                            <label htmlFor="subject">表情包主体描述</label>
                            <button
                                type="button"
                                onClick={() => setIsInspirationModalOpen(true)}
                                className={styles.inspirationButton}
                            >
                                💡 需要灵感？
                            </button>
                        </div>
                        <textarea
                            id="subject"
                            value={subjectDescription}
                            onChange={(e) => setSubjectDescription(e.target.value)}
                            placeholder="例如：一只胖嘟嘟的橘色小猫咪，戴着蓝色蝴蝶结"
                            maxLength={100}
                            rows={3}
                        />
                        <div className={styles.guidance}>
                            <p>请尽可能具体地描述表情包的主角及其主要特征，例如'一只戴眼镜的黄色柴犬'，这将影响 AI 生成的基础形象。</p>
                        </div>
                    </div>
                );
            case 2: // 选择风格
                return (
                    <StyleSelector
                        selectedStyle={selectedStyle}
                        onStyleChange={setSelectedStyle}
                    />
                );
            case 3: // 添加关键词
                return (
                    <div className={styles.keywordsInput}>
                        <div className={styles.keywordsHeader}>
                            <label>
                                {selectedMode === 'single' ? '1个关键词描述' : `${currentKeywordCount}个关键词描述`}
                            </label>
                            <button
                                type="button"
                                onClick={fillRandomKeywords}
                                className={styles.fillButton}
                            >
                                随机填充关键词
                            </button>
                        </div>

                        <div className={styles.keywordsGrid}>
                            {keywords.map((keyword, index) => (
                                <div key={index} className={styles.keywordItem}>
                                    <input
                                        type="text"
                                        value={keyword}
                                        onChange={(e) => handleKeywordChange(index, e.target.value)}
                                        placeholder={`关键词 ${index + 1}`}
                                        maxLength={4}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className={styles.guidance}>
                            <p>请填写与表情包情感或动作相关的词语，例如'开心'、'思考'、'震惊'。每个词语不超过4个字，确保每个词语都能清晰表达一种情绪或动作。</p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={styles.inputSection}>
            {renderStepContent()}
            {error && <div className={styles.error}>{error}</div>}

            <button
                onClick={onGenerate}
                disabled={isLoading}
                className={styles.generateButton}
            >
                {isLoading ? '生成中...' : '生成表情包'}
            </button>

            {/* 灵感建议弹窗 */}
            <InspirationModal
                isOpen={isInspirationModalOpen}
                onClose={() => setIsInspirationModalOpen(false)}
                onSelectSuggestion={handleInspirationSelect}
            />
        </div>
    );
} 