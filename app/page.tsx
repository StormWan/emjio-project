'use client';

import React, { useState } from 'react';
import styles from './page.module.scss';

export default function WelcomePage() {
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleStartCreating = () => {
        setIsTransitioning(true);
        // 平滑过渡到创作页面
        setTimeout(() => {
            window.location.href = '/create';
        }, 500);
    };

    return (
        <main className={`${styles.welcomeMain} ${isTransitioning ? styles.transitioning : ''}`}>
            <div className={styles.backgroundImage} />
            <div className={styles.contentArea}>
                <h1 className={styles.title}>
                    🎨 AI表情包生成器
                </h1>
                <p className={styles.subtitle}>
                    用AI创作你的专属表情包，让聊天更有趣！
                </p>
                <button
                    className={styles.startButton}
                    onClick={handleStartCreating}
                    disabled={isTransitioning}
                >
                    {isTransitioning ? '✨ 正在进入...' : '🚀 开始创作'}
                </button>
                <div className={styles.features}>
                    <div className={styles.feature}>
                        <span className={styles.featureIcon}>🎭</span>
                        <span>多种风格选择</span>
                    </div>
                    <div className={styles.feature}>
                        <span className={styles.featureIcon}>⚡</span>
                        <span>AI快速生成</span>
                    </div>
                    <div className={styles.feature}>
                        <span className={styles.featureIcon}>📦</span>
                        <span>一键打包下载</span>
                    </div>
                </div>
            </div>
        </main>
    );
} 