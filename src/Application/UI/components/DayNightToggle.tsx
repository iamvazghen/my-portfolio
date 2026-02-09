import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import UIEventBus from '../EventBus';
import { Easing } from '../Animation';

const DayNightToggle: React.FC = () => {
    const [mode, setMode] = useState<'day' | 'night'>('day');
    const [labelText, setLabelText] = useState('');
    const [revealDone, setRevealDone] = useState(false);
    const labelRef = useRef('9-5 Shift / Night Shift');
    const visRef = useRef(true);

    const setDay = useCallback(() => {
        setMode('day');
        UIEventBus.dispatch('dayNightToggle', { mode: 'day' });
    }, []);

    const setNight = useCallback(() => {
        setMode('night');
        UIEventBus.dispatch('dayNightToggle', { mode: 'night' });
    }, []);

    const typeText = (
        i: number,
        curText: string,
        text: string,
        setText: React.Dispatch<React.SetStateAction<string>>,
        callback: () => void
    ) => {
        if (i < text.length) {
            setTimeout(() => {
                if (visRef.current === true)
                    window.postMessage(
                        { type: 'keydown', key: `_AUTO_${text[i]}` },
                        '*'
                    );

                setText(curText + text[i]);
                typeText(
                    i + 1,
                    curText + text[i],
                    text,
                    setText,
                    callback
                );
            }, Math.random() * 50 + 50);
        } else {
            callback();
        }
    };

    useEffect(() => {
        if (labelText === '') {
            setTimeout(() => {
                typeText(0, '', labelRef.current, setLabelText, () => {
                    setRevealDone(true);
                });
            }, 150);
        }
    }, []);

    return (
        <div style={styles.container} id="prevent-click">
            {!revealDone && <p>{labelText}</p>}
            {revealDone && (
                <>
                    <motion.span
                        style={mode === 'day' ? styles.active : styles.button}
                        onMouseDown={(event) => {
                            event.preventDefault();
                            setDay();
                        }}
                        animate={mode === 'day' ? 'active' : 'idle'}
                        variants={labelVars}
                    >
                        9-5 Shift
                    </motion.span>
                    <span style={styles.separator}>/</span>
                    <motion.span
                        style={mode === 'night' ? styles.active : styles.button}
                        onMouseDown={(event) => {
                            event.preventDefault();
                            setNight();
                        }}
                        animate={mode === 'night' ? 'active' : 'idle'}
                        variants={labelVars}
                    >
                        Night Shift
                    </motion.span>
                </>
            )}
        </div>
    );
};

const styles: StyleSheetCSS = {
    container: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        fontFamily: 'monospace',
        fontSize: 16,
    },
    button: {
        color: 'white',
        fontSize: 'inherit',
        fontFamily: 'inherit',
        cursor: 'pointer',
        userSelect: 'none',
    },
    active: {
        color: 'white',
        fontSize: 'inherit',
        fontFamily: 'inherit',
        cursor: 'pointer',
        userSelect: 'none',
        textDecoration: 'underline',
    },
    separator: {
        color: 'white',
        fontSize: 'inherit',
        opacity: 0.6,
        userSelect: 'none',
    },
};

const labelVars = {
    active: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.2,
            ease: Easing.expOut,
        },
    },
    idle: {
        opacity: 0.8,
        x: 0,
        transition: {
            duration: 0.2,
            ease: 'easeOut',
        },
    },
};

export default DayNightToggle;
