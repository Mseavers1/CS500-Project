import React, {Dispatch, SetStateAction, useEffect, useRef, useState} from "react";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import axios from "axios";
import {useLocation, useNavigate} from "react-router-dom";
import {useUser} from "./UserContext";
import MathInput from "./MathInput";

type SolverInputProps = {
    answer: string;
    setAnswer: Dispatch<SetStateAction<string>>;
    solution: string | null;
    attempts: number;
    setAttempts: (value: number) => void;
    recordLog: (is_correct: boolean, skipped: boolean) => void;
    generateProblem: () => void;
};

const SolverInput: React.FC<SolverInputProps> = ({
                                                     answer,
                                                     setAnswer,
                                                     solution,
                                                     attempts,
                                                     setAttempts,
                                                     recordLog,
                                                     generateProblem
                                                 }) => {

    function onSubmit() {
        let a = answer;

        // Get answer if it has x=
        if (answer.includes("=")) {
            let div = answer.split("=");
            a = div[1];
        }

        // Check if answer matches solution
        setAttempts(attempts + 1);

        const match = solution?.match(/^\[(.+)\]$/);
        let value = match ? match[1] : null;

        // Check if answer is a fraction, if so, allow answer to be in decimal
        let value_decimal = null
        if (value?.includes("/")) {
            const [numerator, denominator] = value.split("/").map(Number);
            if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
                value_decimal = numerator / denominator;
            }
        } else if (value !== null && !isNaN(Number(value))) {
            value_decimal = parseFloat(value);
        }

        if (solution == "No Solution") {
            value = solution
        }

        //alert(number?.toString() + " " + a)
        let a_decimal = null;
        if (a?.includes("/")) {
            const [numerator, denominator] = a.split("/").map(Number);
            if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
                a_decimal = numerator / denominator;
            }
        } else if (value !== null && !isNaN(Number(value))) {
            a_decimal = parseFloat(value);
        }


        if (a == value?.toString() || (value_decimal != null && a == value_decimal.toString()) || (a_decimal != null && a_decimal == value_decimal)) {
            alert("Correct!")
            setAnswer("");

            recordLog(true, false);
            generateProblem();
        } else if (attempts >= 3) {
            alert("Incorrect (3 attempts used). Correct answer was: " + solution);

            recordLog(false, false);
            generateProblem();
        }
    }

    return (
        <div className="flex flex-col gap-2 items-center justify-center">
            <MathInput OnSubmit={onSubmit} setAnswer={setAnswer} />
        </div>
    )
}

function QuestionSolver () {

    const [problem, setProblem] = useState<string | null>(null);
    const [solution, setSolution] = useState<string | null>(null);
    const [dif, setDif] = useState<number>(2);
    const [answer, setAnswer] = useState<string>("");
    const [attempts, setAttempts] = useState<number>(0);
    const [startTime, setStartTime] = useState<number>(0);

    const location = useLocation();
    const { q_type, topic} = location.state || {};
    const nav = useNavigate();
    const { username } = useUser();

    const generateProblem = async () => {
        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/api/problem/generate/",
                { username: username, q_type: q_type, topic: topic },
                { headers: { "Content-Type": "application/json" } }
            );

            setProblem(response.data.problem);
            setSolution(response.data.solution);
            setDif(response.data.difficulty);
            setStartTime(Date.now())
        } catch (error) {
            alert(error)
        }
    };

    type LogPayload = {
        username: string;
        topic_name: string;
        type_name: string;
        dif: number;
        is_correct: boolean;
        time_taken: number;
        attempts: number;
        skipped: boolean;
    };

    const recordLog = async (is_correct: boolean, skipped: boolean) => {
        try {
            let time_taken = (Date.now() - startTime) / 1000;

            const payload: LogPayload = {
                username: String(username),
                type_name: String(q_type),
                topic_name: String(topic),
                dif: Number(dif),
                is_correct: Boolean(is_correct),
                time_taken: Number(time_taken),
                attempts: Number(attempts),
                skipped: Boolean(skipped),
            };

            const response = await axios.post(
                "http://127.0.0.1:8000/api/problem/log/",
                payload,
                {headers: {"Content-Type": "application/json"}}
            );


            if (!response.data) alert("Failed to log message")

            setAttempts(0);

        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response) {
                console.error("Validation Error:", error.response.data);
                alert(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
            } else {
                console.error("Unexpected Error:", error);
                alert("An unexpected error occurred.");
            }
        }
    }

    useEffect(() => {
        generateProblem();
    }, []);

    function displayProblem(problem: string | null) {

        if (problem === null) {
            return;
        }

        return (
            <BlockMath math={problem} />
        );
    }

    return (
        <div className="flex flex-col justify-center items-center min-h-screen text-center gap-20">


            {/*<p className="text-[40px]"> Current Difficulty: {dif} </p>
            <p className="text-[20px]"> Solution: {solution} </p>*/}
            <div className="flex flex-col">
                <p className="text-4xl font-bold text-black">Solve for X:</p>
                <p className="text-2xl text-black"> {displayProblem(problem)} </p>
                <SolverInput
                    answer={answer}
                    setAnswer={setAnswer}
                    solution={solution}
                    attempts={attempts}
                    setAttempts={setAttempts}
                    recordLog={recordLog}
                    generateProblem={generateProblem}
                />

                <div className="flex flex-row justify-center gap-20">

                    <button
                        className="bg-blue-300 text-white px-4 py-2 rounded-lg hover:bg-blue-400 active:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={() => {

                        }}>
                        Help
                    </button>

                    <button
                        className="bg-blue-300 text-white px-4 py-2 rounded-lg hover:bg-blue-400 active:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={() => {
                            recordLog(false, true);
                            generateProblem();
                        }}>
                        Skip
                    </button>

                </div>
            </div>

        </div>
    )

}

export default QuestionSolver