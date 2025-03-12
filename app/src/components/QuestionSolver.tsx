import React from "react";
import cfgGenerator from "../generators/cfg_generator";

function QuestionSolver () {

    const [ctf, setCTF] = React.useState(() => new cfgGenerator());

    function testing() : string {
        ctf.add("S", ["E=E"], 0);
        ctf.add("T", ["a", "x", "a(T)"], 1);
        ctf.add("E", ["E+T", "E-T", "T", "P", "Q"], 2);
        ctf.add("P", ["(E)(E)"], 3);
        ctf.add("Q", ["(E)/(E)"], 0);

        let weights = new Map<string, number[]>();

        weights.set("S", [1]);
        weights.set("T", [0.45, 0.45, 0.1]);
        weights.set("E", [0.1, 0.1, 0.72, 0.05, 0.03]);
        weights.set("P", [1]);
        weights.set("Q", [1]);

        return ctf.generate(weights);
    }

    return (
        <div className="flex flex-col text-center items-center gap-5">

            <p className="text-2xl font-bold text-black">Solve for X</p>
            <p className="text-xl text-black">{testing()}</p>

            {/* Input & Submit Box */}
            <div className="flex flex-row gap-3">
                <input
                    id="answer"
                    type="text"
                    placeholder="Enter your answer"
                    className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                />

                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 active:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => {
                        //setSelectedTopic(title)
                    }}>
                    Submit
                </button>

            </div>

            <div className="flex flex-row gap-40">

                <button
                    className="bg-blue-300 text-white px-4 py-2 rounded-lg hover:bg-blue-400 active:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => {
                        //setSelectedTopic(title)
                    }}>
                    Help
                </button>

                <button
                    className="bg-blue-300 text-white px-4 py-2 rounded-lg hover:bg-blue-400 active:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => {
                        //setSelectedTopic(title)
                    }}>
                    Skip
                </button>

            </div>

        </div>
    )

}

export default QuestionSolver