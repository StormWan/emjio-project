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
            <div className={styles.backgroundImage}>
                {/* 背景图片容器，您后续添加素材 */}
            </div>
            <div className={styles.contentArea}>
                <h1 className={styles.title}>创作你的专属AI表情包</h1>
                <button
                    className={styles.startButton}
                    onClick={handleStartCreating}
                    disabled={isTransitioning}
                >
                    {isTransitioning ? '正在进入...' : '开始创作'}
                </button>
            </div>
        </main>
    );
} 