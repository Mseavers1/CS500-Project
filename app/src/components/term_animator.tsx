import React, { useEffect, useState } from 'react';
import NormalizedLinearEquation from "../math/linear_equation";
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

function TermAnimator() {

    type term = {
        id: number;
        name: string;
    }

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

    const [terms, setTerms] = useState<term[]>([]);
    const [usedTerms, setUsedTerms] = useState<termPlacement[]>([]);
    const textColors = [
        "#333", "#444", "#222", "#1a1a1a", "#555", "#000", "#e6e6e6",
        "#a2d1f7", "#f5e1a4", "#f4a5c2", "#9bcf8d", "#f0f0f0",
    ];

    useEffect(() => {
        fetch('/data/math_terms.txt')
            .then((response) => response.text())
            .then((data) => {
                const termsArray = data.split('\n').filter(t => t.trim() !== '');
                const loadedTerms = termsArray.map((term, index) => ({ id: index, name: term }));
                setTerms(loadedTerms);
            })
            .catch((error) => console.error('Error fetching the file:', error));
    }, []);

    useEffect(() => {
        if (terms.length === 0) return;

        const spawnTerms = () => {
            const maxTerms = 200; // Number of terms to spawn
            const newTerms: termPlacement[] = [];

            for (let i = 0; i < maxTerms; i++) {
                const term = terms[i % terms.length];
                const pos = findPosition(newTerms);

                const font_size = Math.random() * 10 + 15;
                const nle_opacity = new NormalizedLinearEquation(15, 25, 0.2, 0.5);
                const nle_blur = new NormalizedLinearEquation(15, 25, 1, 2);

                // You can rotate based on the position of the term, either from the center or relative to some point
                const rotation_angle = Math.atan2(pos.y - (document.documentElement.scrollHeight / 2), pos.x - (window.innerWidth / 2)) * (180 / Math.PI);

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
        };


        spawnTerms(); // Spawn terms when data is ready
    }, [terms]);

    const findPosition = (currentUsedTerms: termPlacement[]) => {
        let match = true;
        let x = 0;
        let y = 0;

        const maxHeight = document.documentElement.scrollHeight;
        const maxWidth = window.innerWidth;

        while (match) {
            x = Math.random() * maxWidth;
            y = Math.random() * maxHeight;

            const threshold = 20;
            match = false;

            // Check if the position is too close to another term
            for (const placement of currentUsedTerms) {
                if ((placement.x >= x - threshold && placement.x <= x + threshold) &&
                    (placement.y >= y - threshold && placement.y <= y + threshold)) {
                    match = true;
                }
            }
        }

        return { x, y };
    };

    return (
        <div className="absolute w-full h-full pointer-events-none overflow-x-clip">
            {usedTerms.map((placement) => (
                <div
                    key={placement.term.id}
                    className="math-term"
                    style={{
                        top: `${placement.y}px`,
                        left: `${placement.x}px`,
                        fontSize: `${placement.font_size}`,
                        color: `${placement.text_color}`,
                        whiteSpace: 'nowrap',
                        position: 'absolute',
                        filter: `blur(${placement.blur}px)`,
                        textShadow: '0 0 4px rgba(0, 0, 0, 0.2)',
                        opacity: placement.opacity,
                        transform: `rotate(${placement.rot}deg)`
                    } as React.CSSProperties}
                >
                    {<BlockMath>{placement.term.name}</BlockMath>}
                </div>
            ))}
        </div>
    );
}

export default TermAnimator;
