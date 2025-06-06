import React from 'react';
import styles from './StepProgress.module.scss';

export interface StepProgressProps {
    currentStep: number;
    totalSteps: number;
    stepTitle: string;
}

export default function StepProgress({ currentStep, totalSteps, stepTitle }: StepProgressProps) {
    const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

    return (
        <div className={styles.progressSteps}>
            <div className={styles.progressBar}>
                <div className={styles.progressLine}>
                    <div 
                        className={styles.progressFill} 
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
                <div className={styles.stepIndicator}>
                    <span className={styles.currentStep}>{stepTitle}</span>
                    {` (${currentStep + 1}/${totalSteps})`}
                </div>
            </div>
        </div>
    );
} 