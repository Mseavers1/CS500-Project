import React from "react";

interface InputFieldProps {
    id: string;
    hint: string;
    value: string;
    setValue: React.Dispatch<React.SetStateAction<string>>;
    width?: number;
}

export default function InputField({id, hint, value, setValue, width=400}: InputFieldProps) {

    return (
        <div className="relative" style={{ width: `${width}px` }}>
            <input
                type="text"
                id={id}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder=" "
                className="peer border rounded-lg px-5 pt-5 pb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ width: `${width}px` }}
            />

            <label
                htmlFor={id}
                className={`
                    absolute left-5 transition-all text-base
                    ${value
                        ? "top-0 text-[12px] text-blue-500"
                        : "top-4 text-base text-gray-400"}
                    peer-focus:top-0
                    peer-focus:text-[12px]
                    peer-focus:text-blue-500
                    peer-focus:after:content-[':']
                `}
            >
                {hint}
            </label>
        </div>
    )


}