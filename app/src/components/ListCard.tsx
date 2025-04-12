import {useEffect} from "react";
import Button from "./Button";
import InputField from "./InputField";

interface ListCardProps {
    name: string;
    hint: string;
    value: string;
    setValue: React.Dispatch<React.SetStateAction<string>>;
    items: string[];
    setList: React.Dispatch<React.SetStateAction<string[]>>;
    addDBFunction: () => Promise<null | undefined>;
    delDBFunction: (item_name: string) => Promise<null | undefined>;
    getDBFunction: () => Promise<string[] | null>;
}

export const ListCard: React.FC<ListCardProps> = ({
                                                   name, hint, value, setValue,
                                                   items, setList, addDBFunction,
                                                   delDBFunction, getDBFunction
                                               }) => {

    useEffect(() => {
        const fetchItems = async () => {
            const result = await getDBFunction();
            if (result) setList(result);
        };
        fetchItems();
    }, []);

    const addToList = async () => {
        const res = await addDBFunction();
        if (!res) return;
        setList(prev => [...prev, value]);
        setValue("");
    };

    const removeFromList = async (idx: number) => {
        const item = items[idx];
        await delDBFunction(item);
        setList(prev => prev.filter((_, i) => i !== idx));
    };

    return (
        <div className="flex flex-col items-center bg-amber-100 p-5 shadow w-[400px] h-[400px]">
            <p className="font-bold text-xl text-black">{name}</p>
            <hr className="border-b border-black w-[100%]" />

            <div className="flex flex-col items-center bg-white p-5 mt-5 gap-3 overflow-y-auto flex-grow w-full max-h-[230px]">
                {items.map((item, idx) => (
                    <div key={idx} className="flex flex-row gap-5 items-center w-full justify-between">
                        <div className="w-[300px] text-left">{item}</div>
                        <Button name="X" onClick={() => removeFromList(idx)} backgroundColor="red-500" width={24} px={8} py={2} />
                    </div>
                ))}
            </div>

            <hr className="border-b border-black w-[100%] mt-5" />

            <div className="mt-5 gap-5 flex flex-row">
                <InputField hint={hint} width={240} value={value} setValue={setValue} />
                <Button name="Add" onClick={addToList} />
            </div>
        </div>
    );
};