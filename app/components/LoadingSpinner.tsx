import styles from './LoadingSpinner.module.scss';
import React from 'react';

export default function LoadingSpinner() {
    return (
        <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>AI正在生成表情包，请稍候...</p>
            <div className={styles.progress}>
                <div className={styles.progressBar}></div>
            </div>
        </div>
    );
} 