import Button from "./Button";
import InputField from "./InputField";
import React from "react";

interface CardProps {
    name: string;
    hint: string;
    value: string;
    setValue: React.Dispatch<React.SetStateAction<string>>;
    setList: React.Dispatch<React.SetStateAction<string[]>>;
    items: string[];
}

const Card = (props: CardProps) => {

    function addToList(){
        props.setList(prev => [...prev, props.value]);
        props.setValue("");
    }

    function removeFromList(idx: number) {
        props.setList(prev => prev.filter((_, i) => i !== idx));
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

    return (
        <div className="flex flex-col justify-center text-center gap-5">

            <p className="text-[40px]"> Admin Panel </p>

            <div className="flex flex-row items-start justify-center gap-10">
                <Card name="Topics" items={topicItems} hint="Enter new name" value={topicInput} setValue={setTopicInput} setList={setTopicItems} />
                <Card name="Question Types" items={questionTypesItems} hint="Enter new name" value={questionTypeInput} setValue={setQuestionTypeInput} setList={setQuestionTypesItems} />
                <Card name="Questions" items={questionItems} hint="Enter new name" value={questionInput} setValue={setQuestionInput} setList={setQuestionItems} />
            </div>
        </div>
    )
}