import React, {useEffect} from "react";
import axios from "axios";
import {ListCard} from "./ListCard";
import {QuestionCard} from "./QuestionCard";

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


            </div>
        )
    }

    return (
        <div className="flex flex-col justify-center text-center gap-5">

            <p className="text-[40px]"> Admin Panel </p>

            {questionForm()}

            <div className="flex flex-row items-start justify-center gap-10">
                <ListCard
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