import React, {useEffect} from "react";
import axios from "axios";
import {ListCard} from "./ListCard";
import {QuestionCard, TypeTopicPair} from "./QuestionCard";
import InputField from "./InputField";
import Button from "./Button";
import Selector from "./Selector";

export default function AdminPanelPage() {

    interface Match {
        rule_id: number;
        rule_variable: string;
        rule_ruleset: string;
        rule_cost: number;
        rule_weight: number;
        rule_priority: number;
    }

    const [topicItems, setTopicItems] = React.useState<string[]>([]);
    const [topicInput, setTopicInput] = React.useState("");

    const [questionTypesItems, setQuestionTypesItems] = React.useState<string[]>([]);
    const [questionTypeInput, setQuestionTypeInput] = React.useState("");

    const [questionItems, setQuestionItems] = React.useState<TypeTopicPair[]>([]);
    const [questionInput, setQuestionInput] = React.useState("");

    const [questionFormOpen, setQuestionFormOpen] = React.useState(false);

    const [options, setOptions] = React.useState<string[]>([]);
    const [selectedOption, setSelectedOption] = React.useState<string>("");
    const [selectedTopic, setSelectedTopic] = React.useState<string>("");

    const [currentRules, setCurrentRules] = React.useState<string[]>([]);
    const [currentRuleInput, setCurrentRuleInput] = React.useState("");

    const [weightInput, setWeightInput] = React.useState("");
    const [costInput, setCostInput] = React.useState("");
    const [priorityInput, setPriorityInput] = React.useState("");
    const [variableInput, setVariableInput] = React.useState("");
    const [ruleInput, setRuleInput] = React.useState("");
    const [matches, setMatches] = React.useState<Match[]>([]);

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

    const showRules = async (topic: string, type: string) => {

        if (selectedOption == "" || selectedTopic == "") {
            return;
        }

        try {
            const response = await axios.post(
                "http://127.0.0.1" +
                ":8000/api/question/",
                {topic_name: topic, type_name: type},
                {headers: {"Content-Type": "application/json"}}
            );

            if (response.data.successful) {

                const matches: Match[] = response.data.matches;

                setMatches(matches);
            }
            else {
                alert(response.data.message);
            }


        } catch (error) {
            alert("Error:" + error);
            return null;
        }

    }

    const delRule = async (id: number) => {

        try {
            const response = await axios.post(
                "http://127.0.0.1" +
                ":8000/api/rules/del",
                {rule_id: id, topic_name: selectedTopic, type_name: selectedOption},
                {headers: {"Content-Type": "application/json"}}
            );

            if (response && response.data.successful) {
                alert("Rule removed!");

                // update list
                await showRules(selectedTopic, selectedOption);
            }
            else
            {
                alert(response.data.message);
            }

        } catch (error) {
            alert("Error:" + error);
            return null;
        }
    }

    const addRule = async () => {

        if (variableInput == "" || costInput == "" || ruleInput == "" || weightInput == "" || priorityInput == "") {
            return;
        }

        if (selectedOption == "" || selectedTopic == "") {
            return;
        }

        try {
            const response = await axios.post(
                "http://127.0.0.1" +
                ":8000/api/rules/add",
                {variable: variableInput, cost: costInput, weight: weightInput, priority: priorityInput, rule: ruleInput},
                {headers: {"Content-Type": "application/json"}}
            );

            if (response && response.data.successful) {
                alert("Rule added!");

                // Add to Question Table
                const resp = await axios.post(
                    "http://127.0.0.1" +
                    ":8000/api/question/add",
                    {topic_name: selectedTopic, type_name: selectedOption, rule_id: response.data.id},
                    {headers: {"Content-Type": "application/json"}}
                );

                if (resp && resp.data.successful) {
                    alert("Successfully added question!");

                    // Clear inputs
                    setCostInput("")
                    setRuleInput("")
                    setPriorityInput("")
                    setWeightInput("")
                    setVariableInput("")

                } else {
                    alert(resp.data.message);
                }
            } else
            {
                alert(response.data.message);
            }

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

    const getAllType = async () => {
        try {
            const response = await axios.get(
                "http://127.0.0.1" +
                ":8000/api/question/types",
                {headers: {"Content-Type": "application/json"}}
            );

            setQuestionItems(response.data.types);

            return response.data.types;

        } catch (error) {
            alert("Error:" + error);
            return null;
        }
    }

    const delAllType = async (pair: TypeTopicPair) => {
        try {
            const response = await axios.post(
                "http://127.0.0.1" +
                ":8000/api/question/types/del",
                {topic_name: pair.topic_name, type_name: pair.type_name},
                {headers: {"Content-Type": "application/json"}}
            );

            setQuestionItems(await getAllType());

            return response.data.successful;

        } catch (error) {
            alert("Error:" + error);
            return null;
        }
    }

    const addQuestion = async () => {

        if (selectedOption === "" || selectedOption === "Select type") return;

        setQuestionFormOpen(true);
    }

    const questionForm = () => {

        if (!questionFormOpen) return "";

        return (
            <div className="font-poppins fixed z-10 inset-0 flex items-center justify-center bg-black bg-opacity-50">

                <div className="bg-white p-6 rounded-lg shadow-lg text-center relative flex flex-col gap-3">

                    <div className="absolute top-2 right-2">
                        <Button name={"X"} onClick={async () => {
                            await getAllType();
                            setQuestionFormOpen(false);
                        }} backgroundColor={"red-500"} width={24} px={8} py={2}/>
                    </div>

                    <p className="font-bold text-xl text-black">Create new Question</p>
                    <hr className="border-b border-black w-[100%]"/>

                    <div className="flex flex-row gap-[100px] justify-center">
                        {/* Topic Selector */}
                        <Selector
                            id="topic-select"
                            hint="Select a topic"
                            value={selectedTopic}
                            setValue={setSelectedTopic}
                            items={topicItems}
                            renderItem={(topic, idx) => (
                                <option key={idx} value={topic}>
                                    {topic}
                                </option>
                            )}
                            onChangeFunction={async (e) => {
                                await showRules(e.target.value, selectedOption);
                            }}
                        />


                        {/* Type Selector */}
                        <Selector
                            id="type-select"
                            hint="Select a type"
                            value={selectedOption}
                            setValue={setSelectedOption}
                            items={questionTypesItems}
                            renderItem={(type, idx) => (
                                <option key={idx} value={type}>
                                    {type}
                                </option>
                            )}
                            onChangeFunction={async (e) => {
                                await showRules(selectedTopic, e.target.value);
                            }}
                        />
                    </div>

                    <hr className="border-b border-black w-[100%]"/>

                    {/* Rules */}
                    <div
                        className="flex flex-col items-center bg-white p-5 mt-5 gap-5 overflow-y-auto flex-grow w-full max-h-[230px]">

                        <div
                            className="flex flex-row gap-2 items-center w-full justify-between font-bold border-b pb-2">
                            <div className="w-[100px] text-left">Variable</div>
                            <div className="w-[100px] text-left">Ruleset</div>
                            <div className="w-[100px] text-left">Weight</div>
                            <div className="w-[100px] text-left">Priority</div>
                            <div className="w-[100px] text-left">Cost</div>
                            <div className="w-[100px] text-left">Action</div>
                        </div>


                        {matches.map((m, idx) => (
                            <div key={idx} className="flex flex-row gap-2 items-center w-full justify-between">
                                <div className="w-[100px] text-left">{m.rule_variable}</div>
                                <div className="w-[100px] text-left">{m.rule_ruleset}</div>
                                <div className="w-[100px] text-left">{m.rule_weight}</div>
                                <div className="w-[100px] text-left">{m.rule_priority}</div>
                                <div className="w-[100px] text-left">{m.rule_cost}</div>
                                <Button name="X" onClick={async () => {
                                    await delRule(m.rule_id);
                                }} backgroundColor="red-500"
                                        width={24} px={8} py={2}/>
                            </div>
                        ))}
                    </div>

                    <hr className="border-b border-black w-[100%] mt-5"/>

                    <div className="gap-5 flex flex-row">
                        <InputField id={"variable"} hint="Variable" width={100} value={variableInput}
                                    setValue={setVariableInput}/>
                        <InputField id={"rule"} hint="Rule" width={240} value={ruleInput} setValue={setRuleInput}/>
                        <InputField id={"weight"} hint="Weight" width={100} value={weightInput} setValue={setWeightInput}/>
                        <InputField id={"priority"} hint="Priority" width={100} value={priorityInput} setValue={setPriorityInput}/>
                        <InputField id={"cost"} hint="Cost" width={100} value={costInput} setValue={setCostInput}/>
                        <Button name="Add" onClick={async () => {

                            // Add rule to database
                            await addRule()

                            // Update list
                            await showRules(selectedTopic, selectedOption);

                        }}/>
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
                    hint="Select a type"
                    setList={setQuestionItems}
                    getDBFunction={getAllType}
                    delDBFunction={delAllType}
                    addFunction={addQuestion}
                    options={options}
                />


            </div>
        </div>
    )
}