'use client';

import { Dispatch, SetStateAction } from 'react';
import styles from './InputSection.module.scss';
import React from 'react';

interface InputSectionProps {
    subjectDescription: string;
    setSubjectDescription: Dispatch<SetStateAction<string>>;
    keywords: string[];
    setKeywords: Dispatch<SetStateAction<string[]>>;
    onGenerate: () => void;
    isLoading: boolean;
    error: string;
}

export default function InputSection({
    subjectDescription,
    setSubjectDescription,
    keywords,
    setKeywords,
    onGenerate,
    isLoading,
    error
}: InputSectionProps) {

    const handleKeywordChange = (index: number, value: string) => {
        const newKeywords = [...keywords];
        newKeywords[index] = value;
        setKeywords(newKeywords);
    };

    // const popularKeywords = [
    //     '开心大笑', '思考人生', '震惊', '委屈', '加油', '疑问',
    //     '生气', '哭泣', '睡觉', '吃饭', '工作', '放松',
    //     '惊喜', '无语', '点赞', '比心'
    // ];
    const popularKeywords = [
        '点赞', '比心'
    ];

    const fillPopularKeywords = () => {
        setKeywords([...popularKeywords]);
    };

    return (
        <div className={styles.inputSection}>
            <div className={styles.subjectInput}>
                <label htmlFor="subject">表情包主体描述</label>
                <textarea
                    id="subject"
                    value={subjectDescription}
                    onChange={(e) => setSubjectDescription(e.target.value)}
                    placeholder="例如：简单背景，穿着黑色短袖的男人"
                    maxLength={50}
                    rows={3}
                />
                <div className={styles.guidance}>
                    <p>请尽可能具体地描述表情包的主角及其主要特征，例如'一只戴眼镜的黄色柴犬'，这将影响 AI 生成的基础形象。</p>
                </div>
            </div>

            <div className={styles.keywordsInput}>
                <div className={styles.keywordsHeader}>
                    <label>16个关键词描述</label>
                    <button
                        type="button"
                        onClick={fillPopularKeywords}
                        className={styles.fillButton}
                    >
                        使用热门关键词
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
                                maxLength={5}
                            />
                        </div>
                    ))}
                </div>

                <div className={styles.guidance}>
                    <p>请填写与表情包情感或动作相关的词语，例如'开心大笑'、'思考人生'、'震惊得说不出话'。请避免使用过于抽象或复杂的词语，确保每个词语都能清晰表达一种情绪或动作。</p>
                </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button
                onClick={onGenerate}
                disabled={isLoading}
                className={styles.generateButton}
            >
                {isLoading ? '生成中...' : '生成表情包'}
            </button>
        </div>
    );
} 