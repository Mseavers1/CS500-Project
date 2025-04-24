import React, {useEffect} from "react";
import {ChevronLeftIcon, ChevronRightIcon} from "lucide-react";
import {TypeTopicPair} from "./QuestionCard";
import axios from "axios";
import Button from "./Button";
import {useNavigate} from "react-router-dom";

function TopicSelector () {

    const [selectedTopic, setSelectedTopic] = React.useState("");
    const [topics, setTopics] = React.useState<{topic_name: string; type_name: string[]}[]>([]);
    const [selectedTypes, setSelectedTypes] = React.useState<string[]>([]);
    const nav = useNavigate();

    type CardProps = {
        title: string;
        types: string[]
    };

    type SubCardProps = {
        title: string;
        types: string[];
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:8000/api/question/types", {
                    headers: { "Content-Type": "application/json" },
                });

                const rawList: { topic_name: string; type_name: string }[] = response.data.types;

                if (response.data.successful) {
                    // Group by topic_name
                    const topicMap: Record<string, string[]> = {};

                    for (const { topic_name, type_name } of rawList) {
                        if (!topicMap[topic_name]) {
                            topicMap[topic_name] = [];
                        }
                        topicMap[topic_name].push(type_name);
                    }

                    const grouped = Object.entries(topicMap).map(([topic_name, type_name]) => ({
                        topic_name,
                        type_name,
                    }));

                    setTopics(grouped);
                } else {
                    alert(response.data.message);
                }
            } catch (error) {
                alert("Error: " + error);
            }
        };

        fetchData();
    }, []);


    // Card to hold TOPIC items (grid)
    const Card: React.FC<CardProps> = ({ title, types }) => {
        return (
            <div className="flex flex-col gap-3 bg-white rounded-2xl text-center items-center shadow-lg p-5 max-w-[300px]">
                <h2 className="text-xl font-bold">{title}</h2>
                <hr className="border-[1px] border-gray-300 w-full"/>

                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-[50%]hover:bg-blue-500 active:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={() => {setSelectedTopic(title); setSelectedTypes(types)}}>
                    Select
                </button>

            </div>
        );
    };

    // Card to hold SUBTOPIC items
    const SubCard: React.FC<SubCardProps> = ({ title, types }) => {

        type typeButtonProp = {
            b_name: string;
            q_type: string;
        };

        const TypeButtons: React.FC<typeButtonProp> = ({ b_name, q_type }) => {
            return (
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 active:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => {nav("/solve", { state: {q_type: q_type, topic: selectedTopic} }); }}
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
                    <TypeButtons key={index} b_name={name} q_type={title} />
                ))}

            </div>
        );
    };

    // Topic Menu
    const topicSelector = () => {
        return (
            <div className="grid grid-cols-4 gap-4">
                {topics.map((item, idx) => (
                    <div key={idx} className="">
                        <Card title={item.topic_name} types={item.type_name}/>
                    </div>
                ))}
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

                {/* Left Arrow
                <div
                    className="flex flex-col gap-3 bg-white rounded-2xl text-center items-center shadow-lg p-5 max-w-[300px]">
                    <div className="flex items-center justify-start w-full">
                        <ChevronLeftIcon className="w-6 h-6 text-gray-500"/>
                    </div>
                </div> */}

                {/* 3 Choices
                <div className="flex flex-row gap-5">
                    <SubCard title="Systems of Equations" types={["Word Problems", "Solve for variable"]}/>
                    <SubCard title="Systems of Equations" types={["Word Problems", "Solve for variable"]}/>
                    <SubCard title="Systems of Equations" types={["Word Problems", "Solve for variable"]}/>
                </div> */}

                <div className="grid grid-cols-4 gap-4">
                    {selectedTypes.map((item, idx) => (
                        <div key={idx} className="">
                            <SubCard title={item} types={["Solve"]}/>
                        </div>
                    ))}
                </div>


                {/* Right Arrow
                <div
                    className="flex flex-col gap-3 bg-white rounded-2xl text-center items-center shadow-lg p-5 max-w-[300px]">
                    <div className="flex items-center justify-start w-full">
                        <ChevronRightIcon className="w-6 h-6 text-gray-500"/>
                    </div>
                </div> */}
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