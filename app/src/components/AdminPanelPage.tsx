import React, {useEffect} from "react";
import axios from "axios";
import {ListCard} from "./ListCard";
import {QuestionCard} from "./QuestionCard";
import InputField from "./InputField";
import Button from "./Button";

export default function AdminPanelPage() {

    const [topicItems, setTopicItems] = React.useState<string[]>([]);
    const [topicInput, setTopicInput] = React.useState("");

    const [questionTypesItems, setQuestionTypesItems] = React.useState<string[]>([]);
    const [questionTypeInput, setQuestionTypeInput] = React.useState("");

    const [questionItems, setQuestionItems] = React.useState<string[]>([]);
    const [questionInput, setQuestionInput] = React.useState("");

    const [questionFormOpen, setQuestionFormOpen] = React.useState(false);

    const [options, setOptions] = React.useState<string[]>([]);
    const [selectedOption, setSelectedOption] = React.useState<string>("");
    const [selectedTopic, setSelectedTopic] = React.useState<string>("");

    const [currentRules, setCurrentRules] = React.useState<string[]>([]);
    const [currentRuleInput, setCurrentRuleInput] = React.useState("");

    const addTopic = async () => {

        try {
            const response = await axios.post(
                "http://127.0.0.1" +
                ":8000/api/topics/add",
                {itemName: topicInput},
                {headers: {"Content-Type": "application/json"}}
            );

            return response.data.successful;

        } catch (error) {
            alert("Error:" + error);
            return null;
        }
    }

    const delTopic = async (topic_name: string) => {
        try {
            const response = await axios.post(
                "http://127.0.0.1" +
                ":8000/api/topics/del",
                {itemName: topic_name},
                {headers: {"Content-Type": "application/json"}}
            );

            return response.data.successful;

        } catch (error) {
            alert("Error:" + error);
            return null;
        }
    }

    const getTopics = async () => {
        try {
            const response = await axios.get(
                "http://127.0.0.1" +
                ":8000/api/topics/",
                {headers: {"Content-Type": "application/json"}}
            );

            return response.data;

        } catch (error) {
            alert("Error:" + error);
            return null;
        }
    }

    const addQType = async () => {

        try {
            const response = await axios.post(
                "http://127.0.0.1" +
                ":8000/api/question-types/add",
                {itemName: questionTypeInput},
                {headers: {"Content-Type": "application/json"}}
            );

            setOptions(await getQType());

            return response.data.successful;

        } catch (error) {
            alert("Error:" + error);
            return null;
        }
    }

    const delQType = async (type_name: string) => {
        try {
            const response = await axios.post(
                "http://127.0.0.1" +
                ":8000/api/question-types/del",
                {itemName: type_name},
                {headers: {"Content-Type": "application/json"}}
            );

            setOptions(await getQType());

            return response.data.successful;

        } catch (error) {
            alert("Error:" + error);
            return null;
        }
    }

    const getQType = async () => {
        try {
            const response = await axios.get(
                "http://127.0.0.1" +
                ":8000/api/question-types/",
                {headers: {"Content-Type": "application/json"}}
            );

            setOptions(response.data);

            return response.data;

        } catch (error) {
            alert("Error:" + error);
            return null;
        }
    }

    const addQuestion = () => {

        if (selectedOption === "" || selectedOption === "Select type") return;

        setQuestionFormOpen(true);
    }

    const questionForm = () => {

        if (!questionFormOpen) return "";

        return (
            <div className="font-poppins fixed z-10 inset-0 flex items-center justify-center bg-black bg-opacity-50">

                <div className="bg-white p-6 rounded-lg shadow-lg text-center relative flex flex-col gap-3">

                    <p className="font-bold text-xl text-black">Create new Question</p>
                    <hr className="border-b border-black w-[100%]"/>

                    {/* Topic Selector */}
                    <select
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        className="border rounded-lg px-5 py-2 bg-white focus:outline-none lg:text-lg focus:ring-2 focus:ring-blue-500"
                        style={{width: 240}}
                    >
                        <option value="" disabled>Select a topic</option>
                        {topicItems.map((topic, idx) => (
                            <option key={idx} value={topic}>
                                {topic}
                            </option>
                        ))}
                    </select>

                    {/* Type Selector */}
                    <select
                        value={selectedOption}
                        onChange={(e) => setSelectedOption(e.target.value)}
                        className="border rounded-lg px-5 py-2 bg-white focus:outline-none lg:text-lg focus:ring-2 focus:ring-blue-500"
                        style={{width: 240}}
                    >
                        <option value="" disabled>Select a type</option>
                        {questionTypesItems.map((type, idx) => (
                            <option key={idx} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>

                    <hr className="border-b border-black w-[100%]"/>

                    {/* Rules */}
                    <div
                        className="flex flex-col items-center bg-white p-5 mt-5 gap-3 overflow-y-auto flex-grow w-full max-h-[230px]">
                        {currentRules.map((item, idx) => (
                            <div key={idx} className="flex flex-row gap-5 items-center w-full justify-between">
                                <div className="w-[300px] text-left">{item}</div>
                                {/*<Button name="X" onClick={() => removeFromList(idx)} backgroundColor="red-500"
                                        width={24} px={8} py={2}/> */}
                            </div>
                        ))}
                    </div>

                    <hr className="border-b border-black w-[100%] mt-5"/>

                    <div className="gap-5 flex flex-row">
                        <InputField id={"variable"} hint="S" width={100} value={currentRuleInput} setValue={setCurrentRuleInput}/>
                        <InputField id={"rule"} hint="Enter a new rule" width={240} value={currentRuleInput} setValue={setCurrentRuleInput}/>
                        <InputField id={"weight"} hint="Weight" width={100} value={currentRuleInput} setValue={setCurrentRuleInput}/>
                        <InputField id={"priority"} hint="Priority" width={100} value={currentRuleInput} setValue={setCurrentRuleInput}/>
                        <InputField id={"cost"} hint="Cost" width={100} value={currentRuleInput} setValue={setCurrentRuleInput}/>
                        <Button name="Add" onClick={() => {}}/>
                    </div>

                </div>

            </div>
        )
    }

    return (
        <div className="flex flex-col justify-center text-center gap-5">

            <p className="text-[40px]"> Admin Panel </p>

            {questionForm()}

            <div className="flex flex-row items-start justify-center gap-10">
                <ListCard
                    id="topic"
                    name="Topics"
                    hint="Enter new name"
                    value={topicInput}
                    setValue={setTopicInput}
                    items={topicItems}
                    setList={setTopicItems}
                    addDBFunction={addTopic}
                    delDBFunction={delTopic}
                    getDBFunction={getTopics}
                />

                <ListCard
                    id="question-types"
                    name="Question Types"
                    hint="Enter new name"
                    value={questionTypeInput}
                    setValue={setQuestionTypeInput}
                    items={questionTypesItems}
                    setList={setQuestionTypesItems}
                    addDBFunction={addQType}
                    delDBFunction={delQType}
                    getDBFunction={getQType}
                />

                <QuestionCard
                    name="Questions"
                    items={questionItems}
                    value={selectedOption}
                    setValue={setSelectedOption}
                    hint="Select type"
                    setList={setQuestionItems}
                    getDBFunction={getQType}
                    delDBFunction={delQType}
                    addFunction={addQuestion}
                    isInputField={true}
                    options={options}
                />


            </div>
        </div>
    )
}