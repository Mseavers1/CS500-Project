import React, {Dispatch, SetStateAction, useEffect, useState} from "react";
import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";
import InputField from "./InputField";
import Button from "./Button";

const MathInput = ({ OnSubmit, setAnswer, answer }: {
    OnSubmit: () => void;
    setAnswer: Dispatch<SetStateAction<string>>;
    answer: string;
}) => {
    const [input, setInput] = useState<string>("");

    useEffect(() => {
        setAnswer(input);
    }, [input, setAnswer]);

    useEffect(() => {

        if (answer === "") {
            setInput("");
        }

    }, [answer]);

    const mathButtons = [
        { symbol: "\\int", addText: "\\int", size: 0.8 },
        { symbol: "\\int_{\\Box}^{\\Box}", addText: "\\int_?^?", size: 0.7 },
        { symbol: "\\lim_{x \\to \\Box}", addText: "\\lim_{x \\to ?}", size: 1 },
        { symbol: "\\frac{dx}{x}", addText: "\\frac{dx}{x}", size: 0.8 },
        { symbol: "\\infty", addText: "\\infty", size: 1.3 },
        { symbol: "\\emptyset", addText: "\\emptyset", size: 1.3 },
        { symbol: "\\frac{\\Box}{\\Box}", addText: "\\frac{?}{?}", size: 0.8 },
        { symbol: "\\Box^2", addText: "^2", size: 1 },
        { symbol: "\\pi", addText: "\\pi", size: 1.3 },
        { symbol: "\\sqrt{\\Box}", addText: "\\sqrt{?}", size: 1 },
        { symbol: "\\sqrt[\\Box]{\\Box}", addText: "\\sqrt[?]{?}", size: 1 },
        { symbol: "\\log _{\\Box}\\left(\\right)", addText: "\\log _{?}\\left(?\\right)", size: 1 },
    ];


    const IconButton = ({ text, addText, text_size }: { text: string; addText: string, text_size: number }) => {
        return (
            <button
                className="w-16 h-10 flex items-center justify-center rounded-md bg-blue-200 hover:bg-blue-300 overflow-hidden transform transition-all duration-200 ease-in-out active:scale-90"
                onClick={() => { setInput(prev => prev + addText) }}
                style={{
                    fontSize: `${text_size}rem`,
                    lineHeight: "1",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                }}
            >
                <BlockMath math={text} />
            </button>
        );
    };

    return (
        <div className="p-4">
            <div className="flex flex-col items-center">
                <div className="flex flex-col gap-2 items-center">
                    <div className="flex flex-row gap-2">
                        <InputField id="answer" hint="Enter answer here" value={input} setValue={setInput} />
                        <Button name={"Submit"} onClick={OnSubmit}/>
                    </div>

                    <div className="grid grid-cols-6 gap-2 justify-items-center items-center">
                        {mathButtons.map((btn, idx) => (
                            <IconButton key={idx} text={btn.symbol} addText={btn.addText} text_size={btn.size} />
                        ))}
                    </div>

                </div>

                <div className="mt-4 w-[500px]">
                    <div className="relative border-2 border-gray-300 p-4 rounded-md h-32 overflow-auto select-none">
                        <div className="absolute top-1 left-1 bg-transparent px-1 text-sm text-gray-500">
                            Math Preview
                        </div>
                        <BlockMath math={input} errorColor="#cc0000" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MathInput;
