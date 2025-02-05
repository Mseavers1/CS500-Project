import {ChevronDown, ChevronUp, Eye, EyeOff} from "lucide-react";
import {useEffect, useRef, useState} from "react";

function HomePage() {

    const [showPassword, setShowPassword] = useState(false);
    const [showRecoveryMenu, setShowRecoveryMenu] = useState(false);
    const [showRecoveryItems, setShowRecoveryItems] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);
    const [showPasswordSignUp, setShowPasswordSignUp] = useState(false);
    const [showConfirmPasswordSignUp, setShowConfirmPasswordSignUp] = useState(false);
    const [selectedItem, setSelectedItem] = useState<string>("Select Recovery Option");

    function selectOption(option : string) {
        setSelectedItem(option);
        setShowRecoveryItems(false);
    }

    const signUp = () => {
        return (
            <div className="fixed z-10 inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg text-center relative flex flex-col gap-3">
                    <h2 className="font-poppins text-xl font-semibold">Creating an Account</h2>

                    <div className="flex flex-col gap-3 items-center">
                        {/** Email **/}
                        <input type="text" placeholder="Email*"
                               className="border border-gray-300 rounded-lg px-5 py-2 w-[460px] focus:outline-none focus:ring-2 focus:ring-blue-500"/>

                        <div className="flex flex-row gap-3">
                            {/** Username **/}
                            <input type="text" placeholder="Username*"
                                   className="border border-gray-300 rounded-lg px-5 py-2 w-[225px] focus:outline-none focus:ring-2 focus:ring-blue-500"/>

                            {/** Phone Number **/}
                            <input type="tel" maxLength={10} placeholder="Phone Number (optional)"
                                   className="border border-gray-300 rounded-lg px-5 py-2 w-[225px] focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                        </div>

                        <div className="flex flex-row gap-3">
                            {/** Password **/}
                            <div className="relative">
                                <input
                                    type={showPasswordSignUp ? "text" : "password"}
                                    placeholder="Password*"
                                    className="border border-gray-300 rounded-lg w-[225px] px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-3 flex items-center"
                                    onClick={() => setShowPasswordSignUp(!showPasswordSignUp)}
                                >
                                    {showPasswordSignUp ? <EyeOff size={20}/> : <Eye size={20}/>}
                                </button>
                            </div>

                            {/** Confirm Password **/}
                            <div className="relative">
                                <input
                                    type={showConfirmPasswordSignUp ? "text" : "password"}
                                    placeholder="Confirm Password*"
                                    className="border border-gray-300 rounded-lg w-[225px] px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-3 flex items-center"
                                    onClick={() => setShowConfirmPasswordSignUp(!showConfirmPasswordSignUp)}
                                >
                                    {showConfirmPasswordSignUp ? <EyeOff size={20}/> : <Eye size={20}/>}
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-row gap-[200px]">
                            {/** Next Button **/}
                            <button
                                className="border bg-blue-400 w-[100px] border-gray-300 rounded-lg px-4 py-2 hover:bg-blue-500 active:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white">
                                Next
                            </button>

                            {/** Close Button **/}
                            <button
                                onClick={() => {
                                    setShowSignUp(false)
                                }}
                                className="px-4 py-2 bg-red-500 w-[100px] text-white rounded-lg hover:bg-red-700 focus:outline-none">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const recovery = () => {
        return (
            <div className="fixed z-10 inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center relative">

                    <h2 className="font-poppins text-xl font-semibold">Recovery Options</h2>

                    {/** Recovery Label & Dropdown Box **/}
                    <div className="flex flex-col items-center gap-5">
                        <p className="font-poppins mt-2">Select what you wish to recover.</p>
                        <div className="relative w-64">

                            <button onClick={() => setShowRecoveryItems(!showRecoveryItems)}
                                    className="flex flex-row items-center border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full">
                                <span className="flex-grow text-center">{selectedItem}</span>
                                {showRecoveryItems ? <ChevronUp size={20} className="ml-2 text-gray-600"/> :
                                    <ChevronDown size={20} className="ml-2 text-gray-600"/>}
                            </button>

                            {showRecoveryItems && (
                                <div
                                    className="absolute left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                                    <ul>
                                        <li onClick={() => selectOption("Password")}
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Password
                                        </li>
                                        <li onClick={() => selectOption("Username")}
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Username
                                        </li>
                                        <li onClick={() => selectOption("Email")}
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Email
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/** Input Box **/}
                        <input
                            type="text"
                            placeholder={selectedItem == "Email" ? "Enter your Phone Number" : "Enter your Email or Phone Number"}
                            disabled={selectedItem == "Select Recovery Option"}
                            className={`border rounded-lg px-5 py-2 w-[300px] focus:outline-none focus:ring-2 focus:ring-blue-500 
                                ${selectedItem == "Select Recovery Option"
                                ? "border-gray-300 bg-gray-100 cursor-not-allowed"
                                : "border-blue-200 bg-white"}`}
                        />

                        <div className="flex flex-row gap-20">
                            {/** Next Button **/}
                            <button
                                className="border bg-blue-400 border-gray-300 rounded-lg px-4 py-2 hover:bg-blue-500 active:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white">
                                Next
                            </button>

                            {/** Close Button **/}
                            <button
                                onClick={() => {
                                    setShowRecoveryMenu(false);
                                    setShowRecoveryItems(false)
                                }}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 focus:outline-none">
                                Close
                            </button>
                        </div>


                    </div>

                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center">

            <div className="font-poppins font-bold text-6xl">
                M.A.P
            </div>

            <div className="font-poppins text-2xl">
                A Math Advancement Platform
            </div>

            {showRecoveryMenu && (recovery())}
            {showSignUp && (signUp())}

            <div className="font-poppins flex flex-col p-5 gap-4">
            <input type="text" placeholder="Email or Username"
                       className="border border-gray-300 rounded-lg px-5 py-2 w-[400px] focus:outline-none focus:ring-2 focus:ring-blue-500"/>

                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="border border-gray-300 rounded-lg w-[400px] px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="button"
                        className="absolute inset-y-0 right-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                    </button>
                </div>

                <div className="flex flex-row justify-between -mt-3">
                    <a onClick={() => setShowRecoveryMenu(true)}
                       className="text-blue-500 text-sm text-center hover:underline cursor-pointer">
                        Trouble Logging In?
                    </a>

                    <a onClick={() => setShowSignUp(true)}
                       className="text-blue-500 text-sm text-center hover:underline cursor-pointer">
                        Sign Up
                    </a>
                </div>

                <button
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300">
                    Login
                </button>

            </div>

            <div className="flex flex-col items-center justify-center absolute bottom-0 mt-5">
                Scroll to Learn More
                <ChevronDown size={40} className={`text-gray-600`}/>
            </div>


        </div>
    )
}

export default HomePage;