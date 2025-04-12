import Button from "./Button";
import InputField from "./InputField";
import React, {useEffect} from "react";
import axios from "axios";

interface CardProps {
    name: string;
    hint: string;
    value: string;
    setValue: React.Dispatch<React.SetStateAction<string>>;
    setList: React.Dispatch<React.SetStateAction<string[]>>;
    items: string[];
    addDBFunction: () => Promise<null | undefined>;
    getDBFunction: () => Promise<null | undefined>;
    delDBFunction: (item_name: string) => Promise<null | undefined>;
}

const Card = (props: CardProps) => {

    useEffect(() => {
        const fetchItems = async () => {
            const items = await props.getDBFunction();
            if (items) {
                props.setList(items);
            }
        };

        fetchItems();
    }, []);


    async function addToList() {

        let res = await props.addDBFunction();

        if (!res) return;

        props.setList(prev => [...prev, props.value]);
        props.setValue("");
    }

    async function removeFromList(idx: number) {
        props.setList(prev => prev.filter((_, i) => i !== idx));
        await props.delDBFunction(props.items[idx]);
    }

    return (
        <div className="flex flex-col items-center bg-amber-100 p-5 shadow w-[400px] h-[400px]">

            <p className="font-bold text-xl text-black"> {props.name} </p>
            <hr className="border-b border-black w-[100%]"/>

            <div className="flex flex-col items-center bg-white p-5 mt-5 gap-3 overflow-y-auto flex-grow w-full max-h-[230px]">

                {props.items.map((item, idx) => (
                    <div className="flex flex-row gap-5 items-center w-full justify-between" key={idx}>
                        <div className="w-[300px] text-left">{item}</div>
                        <Button name="X" onClick={() => {removeFromList(idx)}}
                                backgroundColor="red-500" width={24} px={8} py={2}/>
                    </div>

                ))}
            </div>

            <div className="mt-5 gap-5 flex flex-col">
                <hr className="border-b border-black w-[100%]"/>
                <div className="flex flex-row gap-5">
                    <InputField hint={props.hint} width={240} value={props.value} setValue={props.setValue}/>
                    <Button name={"Add"} onClick={() => {addToList()}}/>
                </div>
            </div>

        </div>

    )
}

export default function AdminPanelPage() {

    const [topicItems, setTopicItems] = React.useState<string[]>([]);
    const [topicInput, setTopicInput] = React.useState("");

    const [questionTypesItems, setQuestionTypesItems] = React.useState<string[]>([]);
    const [questionTypeInput, setQuestionTypeInput] = React.useState("");

    const [questionItems, setQuestionItems] = React.useState<string[]>([]);
    const [questionInput, setQuestionInput] = React.useState("");

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

            return response.data;

        } catch (error) {
            alert("Error:" + error);
            return null;
        }
    }

    return (
        <div className="flex flex-col justify-center text-center gap-5">

            <p className="text-[40px]"> Admin Panel </p>

            <div className="flex flex-row items-start justify-center gap-10">
                <Card name="Topics" items={topicItems} hint="Enter new name" value={topicInput} setValue={setTopicInput} setList={setTopicItems} addDBFunction={addTopic} getDBFunction={getTopics} delDBFunction={delTopic} />
                <Card name="Question Types" items={questionTypesItems} hint="Enter new name" value={questionTypeInput} setValue={setQuestionTypeInput} setList={setQuestionTypesItems} addDBFunction={addQType} getDBFunction={getQType} delDBFunction={delQType}/>
                <Card name="Questions" items={questionItems} hint="Enter new name" value={questionInput} setValue={setQuestionInput} setList={setQuestionItems}addDBFunction={addTopic} getDBFunction={getTopics} delDBFunction={delTopic}/>
            </div>
        </div>
    )
}