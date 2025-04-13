import React from "react";

interface SelectorProps <T> {
    id: string
    hint: string
    value: string
    setValue: React.Dispatch<React.SetStateAction<string>>;
    onChangeFunction?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;

}

export default function Selector<T>({id, hint, value, setValue, items, renderItem, onChangeFunction}: SelectorProps <T>) {

    return (
        <div className="relative" style={{width: 240}}>
            <select
                id={id}
                value={value}
                onChange={async (e) => {
                    setValue(e.target.value);
                    if (onChangeFunction) onChangeFunction(e);
                }}
                className="peer border rounded-lg px-5 pt-5 pb-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none w-full"
            >
                <option value="" disabled hidden></option>
                {items.map(renderItem)}
            </select>

            <label
                htmlFor={id}
                className={`
                            absolute left-5 transition-all text-base pointer-events-none
                            ${value
                    ? "top-0 text-[12px] text-blue-500"
                    : "top-4 text-base text-gray-400"}
                            peer-focus:top-0
                            peer-focus:text-[12px]
                            peer-focus:text-blue-500
                            `}
            >
                {hint}
            </label>

            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                </svg>
            </div>
        </div>
    )

}