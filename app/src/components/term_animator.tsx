import React, { useEffect, useState } from 'react';
import NormalizedLinearEquation from "../math/linear_equation";
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import {useLocation} from "react-router-dom";

export type term = {
    id: number;
    name: string;
}

function TermAnimator({terms}: {terms: term[]}) {

    const location = useLocation();

    type termPlacement = {
        term: term;
        x: number;
        y: number;
        opacity: number;
        font_size: string;
        blur: number;
        rot: number;
        text_color: string;
    }

    const [usedTerms, setUsedTerms] = useState<termPlacement[]>([]);
    const [animationKeySuffix, setAnimationKeySuffix] = useState(0);

    const textColors = [
        //"#333", "#444", "#222", "#1a1a1a", "#555", "#000", "#e6e6e6",
        "#a2d1f7", "#f5e1a4", "#f4a5c2", "#9bcf8d", "#f0f0f0","#c3a2f7", "#AAA",
        "#a4f5e1", "#f7c3a2", "#d1a2f7", "#a2f7c3", "#f7a2d1", "#e1f5a4", "#a4e1f5", "#cccccc", "#dddddd"
    ];

    useEffect(() => {
        if (terms.length === 0) return;

        const spawnTerms = () => {
            const maxTerms = location.pathname === "/" ? 200 : 100;
            const booster = location.pathname === "/" ? 1 : 1.5;
            const newTerms: termPlacement[] = [];

            for (let i = 0; i < maxTerms; i++) {
                const term = terms[i % terms.length];
                const pos = findPosition(newTerms);

                const font_size = Math.random() * 10 + 15;
                const nle_opacity = new NormalizedLinearEquation(15, 25, 0.2 / booster, 0.5 / booster);
                const nle_blur = new NormalizedLinearEquation(15, 25, 1 * booster, 2 * booster);

                const distanceToCenter = Math.abs(pos.x - (window.innerWidth / 2));
                const nle_rot = new NormalizedLinearEquation(0, (window.innerWidth / 2), 20, 45);

                const side = pos.x > (window.innerWidth / 2) ? 1 : -1;

                //const rotation_angle = Math.atan2(pos.y - (window.innerHeight / 2), pos.x - (window.innerWidth / 2)) * (180 / Math.PI);
                const rotation_angle = (Math.random() * nle_rot.calc(distanceToCenter) + 10) * side;

                const placement_term: termPlacement = {
                    term: term,
                    x: pos.x,
                    y: pos.y,
                    opacity: nle_opacity.calc(font_size),
                    font_size: `${font_size}px`,
                    blur: nle_blur.calc(font_size),
                    rot: rotation_angle, // Now rotation is correctly calculated
                    text_color: textColors[Math.floor(Math.random() * textColors.length)],
                };

                newTerms.push(placement_term);
            }

            setUsedTerms(newTerms);
            setAnimationKeySuffix(prev => prev + 1);
        };

        // A small delay can sometimes help the visual transition
        const spawnTimer = setTimeout(() => {
            spawnTerms();
        }, 50);

        // Cleanup
        return () => {
            clearTimeout(spawnTimer);
            setUsedTerms([]);
        };

    }, [terms, location.pathname]);

    const findPosition = (currentUsedTerms: termPlacement[]) => {
        let x = 0;
        let y = 0;
        let attempts = 0;
        const maxAttempts = 50;

        const maxHeight = location.pathname === "/" ? document.documentElement.scrollHeight : window.innerHeight;
        const maxWidth = window.innerWidth;

        const threshold = 20;

        while (attempts < maxAttempts) {
            x = Math.random() * maxWidth;
            y = Math.random() * maxHeight;

            let match = false;
            for (const placement of currentUsedTerms) {
                if (
                    Math.abs(placement.x - x) < threshold &&
                    Math.abs(placement.y - y) < threshold
                ) {
                    match = true;
                    break;
                }
            }

            if (!match) {
                return { x, y };
            }

            attempts++;
        }

        return { x, y };
    };


    const adjustPosition = (el: HTMLDivElement | null) => {
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const screenWidth = window.innerWidth;

        if (rect.right > screenWidth) {
            // Push it back to fit inside
            const overflowAmount = rect.right - screenWidth;
            el.style.left = `${el.offsetLeft - overflowAmount}px`; // 10px margin
        }
        if (rect.left < 0) {
            // If somehow went off the left side too
            el.style.left = `10px`;
        }
    };


    return (
        <div className="w-full h-full overflow-hidden pointer-events-none" style={{top: 0, left: 0, zIndex: -1}}>
            {usedTerms.map((placement, index) => (
                <div
                    key={`${placement.term.id}-${animationKeySuffix}`}
                    className="math-term animate-fade-in"
                    ref={(el) => adjustPosition(el)}
                    style={{
                        zIndex: -1,
                        top: `${placement.y}px`,
                        left: `${placement.x}px`,
                        fontSize: `${placement.font_size}`,
                        color: `${placement.text_color}`,
                        whiteSpace: 'nowrap',
                        position: 'absolute',
                        filter: `blur(${placement.blur}px)`,
                        textShadow: '0 0 4px rgba(0, 0, 0, 0.2)',
                        //opacity: placement.opacity,
                        //transform: `rotate(${placement.rot}deg)`,
                        'opacity': String(placement.opacity),
                        '--rotate': `${placement.rot}deg`,
                    } as React.CSSProperties}
                >
                    <BlockMath>{placement.term.name}</BlockMath>
                </div>
            ))}

        </div>
    );
}

export default TermAnimator;
