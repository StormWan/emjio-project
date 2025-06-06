import React from 'react';
import styles from './LoadingSpinner.module.scss';

interface LoadingSpinnerProps {
    message?: string;
}

export default function LoadingSpinner({ message = 'AI正在生成表情包，请稍候...' }: LoadingSpinnerProps) {
    return (
        <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <div className={styles.loadingText}>{message}</div>
            <div className={styles.progress}>
                <div className={styles.progressBar}></div>
            </div>
        </div>
    );
} 