import {ChevronDown, ChevronUp, Eye, EyeOff} from "lucide-react";
import React, {useEffect, useRef, useState} from "react";

import IError from "./IError";

function HomePage() {

    const [showPassword, setShowPassword] = useState(false);
    const [showRecoveryMenu, setShowRecoveryMenu] = useState(false);
    const [showRecoveryItems, setShowRecoveryItems] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);
    const [showPasswordSignUp, setShowPasswordSignUp] = useState(false);
    const [showConfirmPasswordSignUp, setShowConfirmPasswordSignUp] = useState(false);
    const [selectedItem, setSelectedItem] = useState<string>("Select Recovery Option");

    const [emailSignUp, setEmailSignUp] = useState<string>("");
    const [usernameSignUp, setUsernameSignUp] = useState<string>("");
    const [phoneSignUp, setPhoneSignUp] = useState<string>("");
    const [passwordSignUp, setPasswordSignUp] = useState<string>("");
    const [confirmPasswordSignUp, setConfirmPasswordSignUp] = useState<string>("");

    const [loginField1, setLoginField1] = useState<string>("");
    const [passwordLogin, setPasswordLogin] = useState<string>("");

    const [errorSignUp, setErrorSignUp] = useState<IError[]>([]);
    const [errorSignIn, setErrorSignIn] = useState<IError[]>([]);

    function selectOption(option : string) : void {
        setSelectedItem(option);
        setShowRecoveryItems(false);
    }

    function validateResponses(setError: React.Dispatch<React.SetStateAction<IError[]>>, isSignUp : boolean = true) : void {

        setError([]);

        if (isSignUp) {

            // Validate Email
            validateEmail(emailSignUp, setError);

            // Validate Username
            validateUsername(usernameSignUp, setError);

            // Validate Phone
            validatePhone(phoneSignUp, setError);

            // Validate Passwords
            validatePassword(passwordSignUp, confirmPasswordSignUp, setError);

        } else {

            // Validate field1
            validateField(loginField1, passwordLogin, setError);
        }

    }

    function validateField(field: string, password: string, setError: React.Dispatch<React.SetStateAction<IError[]>>) : void {

        let msg : string = "";
        const numbersAndDashesRegex = /^[0-9-]+$/;

        // Is field empty?
        if (field === "") msg = "Cannot leave field blank."

        // Figure out what type the first field is (phone, email, or username) then validate
        else if (field.includes('@')) { // Email?

            // Confirm valid email
            if (!isEmail(field)) msg = "Please enter a valid email.";

            // Confirm if email exist

            // Confirm email and password matches

        }

        // Is Phone?
        else if (numbersAndDashesRegex.test(field)) {

            // Confirm valid phone
            if (!isPhone(field)) msg = "Please enter a valid phone number.";

            // Confirm if account exist with phone

            // Confirm phone and password matches

        }

        // Must be a username
        else {

            // Confirm valid username
            if (field.includes(' ')) msg = "Please enter a valid username.";

            // Confirm if username exist in system

            // Confirm if username and password matches

        }

        const err : IError = {message: msg, type: "Input"};
        setError(prevState => [...prevState, err]);
    }

    function isPhone(phone: string): boolean {
        const phoneRegex = /^(?:\d{10}|\d{3}[-\s]?\d{3}[-\s]?\d{4})$/;

        return phoneRegex.test(phone);
    }

    function isEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return emailRegex.test(email);
    }

    function validateEmail(email : string, setError: React.Dispatch<React.SetStateAction<IError[]>>) {

        let msg : string = "";

        // Check if empty
        if (email === "") msg = "Please enter a email address.";

        // Check if is email address
        else if (!isEmail(email)) msg = "Please enter a valid email address.";

        // Check if taken

        // Return if no error
        else return;

        const err : IError = {message: msg, type: "Email"};
        setError(prevState => [...prevState, err]);


    }

    function validateUsername(username : string, setError: React.Dispatch<React.SetStateAction<IError[]>>) {

        let msg : string = "";
        const numbersAndDashesRegex = /^[0-9-]+$/;

        // Check if empty
        if (username === "") msg = "Please enter a username.";

        // Check if there is a @ sign
        else if (username.includes('@')) msg = "Username can not have the @ symbol in it.";

        // Check if there is only numbers
        else if (numbersAndDashesRegex.test(username)) msg = "Username must have at least 1 non-numerical or - character.";

        // Check if there is any spaces
        else if (username.includes(' ')) msg = "Username can not have any spaces in it.";

        // Check if taken

        // Return if no error
        else return;

        const err : IError = {message: msg, type: "Username"};
        setError(prevState => [...prevState, err]);

    }

    function validatePhone(phone : string, setError: React.Dispatch<React.SetStateAction<IError[]>>) {
        let msg : string = "";

        if (phone === "") return;

        // Check if there are only numbers
        if (!isPhone(phone)) msg = "Please enter a valid phone number.";

        // Check if taken

        // Return if no error
        else return;

        const err : IError = {message: msg, type: "Phone"};
        setError(prevState => [...prevState, err]);
    }

    function writeError(type : string, getError: IError[]) {
        const err = getError.find(error => error.type === type);
        return err ? errorText(err) : "";
    }

    function validatePassword(password : string, confirmPassword : string, setError: React.Dispatch<React.SetStateAction<IError[]>>) {

        let msg : string = "";
        const upperCaseRegex = /[A-Z]/;
        const lowerCaseRegex = /[a-z]/;
        const numberRegex = /\d/;

        // Check if the confirmation password is empty
        if (confirmPassword === "") {
            msg = "Please enter a password";
            const err2 : IError = {message: msg, type: "Confirm Password"};
            setError(prevState => [...prevState, err2]);
        }

        // Check if empty
        if (password === "") msg = "Please enter a password.";

        // Check if password has min length of 8
        else if (password.length < 8) msg = "Passwords must be at least 8 characters long.";

        // Check if contains 1 uppercase letter
        else if (!upperCaseRegex.test(password)) msg = "Passwords must have at least 1 uppercase letter.";

        // Check if contains 1 lowercase letter
        else if (!lowerCaseRegex.test(password)) msg = "Passwords must have at least 1 lowercase letter.";

        // Check if contains 1 number
        else if (!numberRegex.test(password)) msg = "Passwords must have at least 1 number.";

        // Check if Passwords matches
        else if (password !== confirmPassword) {
            msg = "Passwords do not match.";
            const err2 : IError = {message: msg, type: "Confirm Password"};
            setError(prevState => [...prevState, err2]);
        }

        // Return if no error
        else return;

        const err : IError = {message: msg, type: "Password"};
        setError(prevState => [...prevState, err]);

    }

    const errorText = (error : IError | undefined) => {

        if (error === undefined) {
            return " "
        }

        return (
            <p className="font-poppins text-red-500 text-sm text-left self-start italic pl-5">
                {error.message}
            </p>
        )
    }

    const signUp = () => {

        return (
            <div className="font-poppins fixed z-10 inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg text-center relative flex flex-col gap-3">
                    <h2 className="font-poppins text-xl font-semibold">Creating an Account</h2>

                    <div className="flex flex-col gap-3 items-center">
                        {/** Email **/}
                        <div className="flex flex-col gap-1">
                            <input type="text" placeholder="Email*" value={emailSignUp} onChange={(e) => setEmailSignUp(e.target.value)}
                                   className="border border-gray-300 rounded-lg px-5 py-2 w-[730px] focus:outline-none focus:ring-2 focus:ring-blue-500"/>

                            {writeError("Email", errorSignUp)}
                        </div>

                        <div className="flex flex-row gap-3">

                            {/** Username **/}
                            <div className="flex flex-col gap-1">
                                <input type="text" placeholder="Username*" value={usernameSignUp} onChange={(e) => setUsernameSignUp(e.target.value)}
                                       className="border border-gray-300 rounded-lg px-5 py-2 w-[360px] focus:outline-none focus:ring-2 focus:ring-blue-500"/>

                                {writeError("Username", errorSignUp)}
                            </div>

                            {/** Phone Number **/}
                            <div className="flex flex-col gap-1">
                                <input type="tel" maxLength={14} placeholder="Phone Number" value={phoneSignUp} onChange={(e) => setPhoneSignUp(e.target.value)}
                                       className="border border-gray-300 rounded-lg px-5 py-2 w-[360px] focus:outline-none focus:ring-2 focus:ring-blue-500"/>

                                {writeError("Phone", errorSignUp)}
                            </div>

                        </div>

                        <div className="flex flex-row gap-3">
                            {/** Password **/}
                            <div className="flex flex-col gap-1">
                                <div className="relative">
                                    <input
                                        type={showPasswordSignUp ? "text" : "password"}
                                        placeholder="Password*"
                                        value={passwordSignUp} onChange={(e) => setPasswordSignUp(e.target.value)}
                                        className="border border-gray-300 rounded-lg w-[360px] px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-3 flex items-center"
                                        onClick={() => setShowPasswordSignUp(!showPasswordSignUp)}
                                    >
                                        {showPasswordSignUp ? <EyeOff size={20}/> : <Eye size={20}/>}
                                    </button>
                                </div>

                                {writeError("Password", errorSignUp)}
                            </div>

                            {/** Confirm Password **/}
                            <div className="flex flex-col gap-1">
                                <div className="relative">
                                    <input
                                        type={showConfirmPasswordSignUp ? "text" : "password"}
                                        placeholder="Confirm Password*"
                                        value={confirmPasswordSignUp} onChange={(e) => setConfirmPasswordSignUp(e.target.value)}
                                        className="border border-gray-300 rounded-lg w-[360px] px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-3 flex items-center"
                                        onClick={() => setShowConfirmPasswordSignUp(!showConfirmPasswordSignUp)}
                                    >
                                        {showConfirmPasswordSignUp ? <EyeOff size={20}/> : <Eye size={20}/>}
                                    </button>
                                </div>

                                {writeError("Confirm Password", errorSignUp)}
                            </div>
                        </div>

                        <div className="flex flex-row gap-[200px]">
                            {/** Next Button **/}
                            <button
                                className="border bg-blue-400 w-[100px] border-gray-300 rounded-lg px-4 py-2 hover:bg-blue-500 active:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                                onClick={() => {validateResponses(setErrorSignUp)}}
                            >
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
                            placeholder={selectedItem === "Email" ? "Enter your Phone Number" : "Enter your Email or Phone Number"}
                            disabled={selectedItem === "Select Recovery Option"}
                            className={`border rounded-lg px-5 py-2 w-[300px] focus:outline-none focus:ring-2 focus:ring-blue-500 
                                ${selectedItem === "Select Recovery Option"
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

                <div className="flex flex-col gap-1">
                    <input type="text" placeholder="Email, Username or Phone Number"
                           value={loginField1} onChange={(e) => setLoginField1(e.target.value)}
                           className="border border-gray-300 rounded-lg px-5 py-2 w-[400px] focus:outline-none focus:ring-2 focus:ring-blue-500"/>

                    {writeError("Input", errorSignIn)}
                </div>


                <div className="flex flex-col gap-3">
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

                    {}
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
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    onClick={() => validateResponses(setErrorSignIn, false)}>
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