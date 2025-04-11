import React from "react";

interface InputFieldProps {
    hint: string;
    value: string;
    setValue: React.Dispatch<React.SetStateAction<string>>;
    width?: number;
}

export default function InputField({hint, value, setValue, width=400}: InputFieldProps) {

    return (
        <input type="text" placeholder={hint}
               value={value} onChange={(e) => setValue(e.target.value)}
               className={`border rounded-lg px-5 py-2 focus:outline-none lg:text-lg focus:ring-2 focus:ring-blue-500 `}
               style={{ width: `${width}px` }}
        />
    )

}