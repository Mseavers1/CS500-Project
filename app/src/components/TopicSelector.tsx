import React from "react";
import {ChevronLeftIcon, ChevronRightIcon} from "lucide-react";

function TopicSelector () {

    const [selectedTopic, setSelectedTopic] = React.useState("");

    type CardProps = {
        title: string;
        description: string;
    };

    type SubCardProps = {
        title: string;
        types: string[];
    };

    // Card to hold TOPIC items (grid)
    const Card: React.FC<CardProps> = ({ title, description }) => {
        return (
            <div className="flex flex-col gap-3 bg-white rounded-2xl text-center items-center shadow-lg p-5 max-w-[300px]">
                <h2 className="text-xl font-bold">{title}</h2>
                <hr className="border-[1px] border-gray-300 w-full"/>
                <p className="text-gray-600">{description}</p>

                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-[50%]hover:bg-blue-500 active:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={() => {setSelectedTopic(title)}}>
                    Select
                </button>

            </div>
        );
    };

    // Card to hold SUBTOPIC items
    const SubCard: React.FC<SubCardProps> = ({ title, types }) => {

        type typeButtonProp = {
            b_name: string;
        };

        const TypeButtons: React.FC<typeButtonProp> = ({ b_name }) => {
            return (
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 active:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {b_name}
                </button>
            );
        };

        return (
            <div
                className="flex flex-col gap-3 bg-white rounded-2xl text-center items-center shadow-lg p-5 max-w-[300px]">
                <h2 className="text-xl font-bold">{title}</h2>
                <hr className="border-[1px] border-gray-300 w-full"/>

                {types.map((name, index) => (
                    <TypeButtons key={index} b_name={name} />
                ))}

            </div>
        );
    };

    // Topic Menu
    const topicSelector = () => {
        return (
            <div className="grid grid-cols-4 gap-4">
                <Card title="Algebra" description="Learn to solve equations, simplify expressions, and more!" />
                <Card title="Calculus" description="Explore derivatives, integrals, and other advanced concepts!" />
                <Card title="Geometry" description="Study shapes, angles, and geometric properties!" />
                <Card title="Statistics" description="Understand data analysis, probability, and more!" />
            </div>
        );
    };


    // Subtopic Menu
    const subtopicSelector = () => {
        return (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex justify-center gap-5 items-center z-20">

                {/* Close Button */}
                <div className="flex items-center justify-between w-full px-4 py-2 absolute top-5 left-0 z-30">
                    <p className="text-white text-3xl font-bold">{selectedTopic}</p>
                    <button
                        className="bg-red-500 text-white text-center px-4 py-2 rounded-lg hover:bg-red-600 w-[50%]hover:bg-red-500 active:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                        onClick={() => {
                            setSelectedTopic("")
                        }}>
                        X
                    </button>
                </div>

                {/* Left Arrow */}
                <div
                    className="flex flex-col gap-3 bg-white rounded-2xl text-center items-center shadow-lg p-5 max-w-[300px]">
                    <div className="flex items-center justify-start w-full">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-500"/>
                    </div>
                </div>

                {/* 3 Choices */}
                <div className="flex flex-row gap-5">
                    <SubCard title="Systems of Equations" types={["Word Problems", "Solve for variable"]}/>
                    <SubCard title="Systems of Equations" types={["Word Problems", "Solve for variable"]}/>
                    <SubCard title="Systems of Equations" types={["Word Problems", "Solve for variable"]}/>
                </div>

                {/* Right Arrow */}
                <div
                    className="flex flex-col gap-3 bg-white rounded-2xl text-center items-center shadow-lg p-5 max-w-[300px]">
                    <div className="flex items-center justify-start w-full">
                        <ChevronRightIcon className="w-6 h-6 text-gray-500"/>
                    </div>
                </div>
            </div>
        );
    };


    return (
        <div className="">

            {topicSelector()}

            {selectedTopic === "" ? "" : subtopicSelector()}


        </div>
    )

}

export default TopicSelector;