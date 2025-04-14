import React, {useEffect} from "react";
import Button from "./Button";
import InputField from "./InputField";
import Selector from "./Selector";

export type TypeTopicPair = {
    type_name: string;
    topic_name: string;
};

interface QuestionCardProps {
    name: string;
    items: TypeTopicPair[];
    value: string;
    setValue: React.Dispatch<React.SetStateAction<string>>;
    hint: string;
    setList: React.Dispatch<React.SetStateAction<TypeTopicPair[]>>;
    getDBFunction: () => Promise<TypeTopicPair[] | null>;
    delDBFunction: (item: TypeTopicPair) => Promise<null | undefined>;
    addFunction: () => void;
    options: string[];
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
                                                              name,
                                                              items,
                                                              value,
                                                              setValue,
                                                              hint,
                                                              setList,
                                                              getDBFunction,
                                                              delDBFunction,
                                                              addFunction,
                                                              options,
                                                          }) => {

    useEffect(() => {
        const fetchData = async () => {
            const result: TypeTopicPair[] | null = await getDBFunction();
            if (result) setList(result);
        };
        fetchData();
    }, []);

    const handleAdd = async () => {
        addFunction();
    };

    const handleDelete = async (idx: number) => {
        const item = items[idx];
        await delDBFunction(item);
        const updated = await getDBFunction();
        if (updated) setList(updated);
    };

    return (
        <div className="flex flex-col items-center bg-amber-100 p-5 shadow w-[400px] h-[400px]">
            <p className="font-bold text-xl text-black">{name}</p>
            <hr className="border-b border-black w-full" />

            <div className="flex flex-col items-center bg-white p-5 mt-5 gap-3 overflow-y-auto flex-grow w-full max-h-[230px]">
                {items.map((item, idx) => (
                    <div key={idx} className="flex flex-row gap-5 items-center justify-between w-full">
                        <div className="w-[150px] text-left">{item.type_name}</div>
                        <div className="w-[150px] text-left">{item.topic_name}</div>
                        <Button name="X" onClick={() => handleDelete(idx)} backgroundColor="red-500" width={24} px={8}
                                py={2}/>
                    </div>
                ))}
            </div>

            <hr className="border-b border-black w-full mt-5" />

            <div className="mt-5 gap-5 flex flex-row">

                <Selector
                    id="type-select-main"
                    hint={hint}
                    value={value}
                    setValue={setValue}
                    items={options}
                    renderItem={(o, idx) => (
                        <option key={idx} value={o}>
                            {o}
                        </option>
                    )}
                />

                <Button name="Add" onClick={handleAdd}/>
            </div>
        </div>
    );
};