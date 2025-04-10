import React, {useEffect, useState} from "react";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import axios from "axios";

function QuestionSolver () {

    const [problem, setProblem] = useState<string | null>(null);
    const [solution, setSolution] = useState<string | null>(null);
    const [complexityValue, setComplexity] = useState<number>(3);
    const [answer, setAnswer] = useState<string>("");

    const generateProblem = async (complexity: number) => {
        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/api/problem/generate/",
                { complexity },
                { headers: { "Content-Type": "application/json" } }
            );

            //alert(response.data.output)

            setProblem(response.data.problem);
            setSolution(response.data.solution);
        } catch (error) {
            console.error("Error fetching problem:", error);
        }
    };

    useEffect(() => {
        generateProblem(complexityValue);
    }, []);

    const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setComplexity(Number(event.target.value));
    };

    function displayProblem(problem: string | null) {

        if (problem === null) {
            return;
        }

        return (
            <BlockMath math={problem} />
        );
    }

    return (
        <div className="flex flex-col text-center items-center gap-5">

            <div className="slider-container" style={{padding: "20px", textAlign: "center"}}>
                <h2>Complexity: {complexityValue}</h2>

                {/* Slider */}
                <input
                    type="range"
                    min="0"
                    max="200"
                    value={complexityValue}
                    onChange={handleSliderChange}
                    style={{width: "80%"}}
                />
            </div>

            <p className="text-2xl font-bold text-black">Solve for X</p>
            <p className="text-xl text-black"> {displayProblem(problem)} </p>

            {/* Input & Submit Box */}
            <div className="flex flex-row gap-3">
                <input
                    id="answer"
                    type="text"
                    placeholder="Enter your answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                />

                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 active:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => {

                        let a = answer;

                        // Get answer if it has x=
                        if (answer.includes("=")) {
                            let div = answer.split("=");
                            a = div[1];
                        }

                        // Check if answer matches solution
                        if (a == solution) {
                            alert("Correct!")
                        }
                        else {
                            alert("Incorrect. Correct answer was: " + solution)
                        }

                        generateProblem(complexityValue);
                    }}>
                    Submit
                </button>

            </div>

            <div className="flex flex-row gap-40">

                <button
                    className="bg-blue-300 text-white px-4 py-2 rounded-lg hover:bg-blue-400 active:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => {

                    }}>
                    Help
                </button>

                <button
                    className="bg-blue-300 text-white px-4 py-2 rounded-lg hover:bg-blue-400 active:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => {
                        generateProblem(complexityValue);
                    }}>
                    Skip
                </button>

            </div>

        </div>
    )

}

export default QuestionSolver