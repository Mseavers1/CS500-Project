import {ChevronDown, ChevronUp, Eye, EyeOff} from "lucide-react";
import React, {useEffect, useRef, useState} from "react";

import IError from "./IError";
import axios from "axios";

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

    const [recoveryField, setRecoveryField] = useState<string>("");
    const [recoveryCode, setRecoveryCode] = useState<boolean>(false);
    const [recoveryCodeInput, setRecoveryCodeInput] = useState<string>("");

    useEffect(() => {
        axios.get("http://127.0.0.1:8000/api/data").then(response => alert(response.data.data)).catch(error => console.log(error));
    }, [loginField1]);

    function selectOption(option : string) : void {
        setSelectedItem(option);
        setShowRecoveryItems(false);
    }

    async function validateResponses(setError: React.Dispatch<React.SetStateAction<IError[]>>, isSignUp : boolean = true) {

        setError([]);

        if (isSignUp) {

            // Validate Email
            const e1 = await validateEmail(emailSignUp.toLowerCase(), setError);

            // Validate Username
            const e2 = await validateUsername(usernameSignUp.toLowerCase(), setError);

            // Validate Phone
            const e3 = await validatePhone(phoneSignUp, setError);

            // Validate Passwords
            const e4 = validatePassword(passwordSignUp, confirmPasswordSignUp, setError);

            // If no errors, Create an account
            if (!e1 && !e2 && (!e3 || undefined) && !e4) {

                let success = await register(emailSignUp.toLowerCase(), usernameSignUp.toLowerCase(), passwordSignUp, "student", phoneSignUp);

                // Successfully created an account
                if (success?.data.message === "User created successfully!") {
                    alert("successfully created an account!");
                    setShowSignUp(false);
                    setEmailSignUp("");
                    setUsernameSignUp("");
                    setPasswordSignUp("");
                    setConfirmPasswordSignUp("");
                    setPhoneSignUp("");
                    return;
                }

                // Unknown error occurred
                const err : IError = {message: "An unknown error has occurred", type: "Email"};
                const err2 : IError = {message: "An unknown error has occurred", type: "Password"};
                setError(prevState => [...prevState, err, err2]);
            }

        } else {

            // Validate field1
            await validateField(loginField1, passwordLogin, setError);
        }

    }

    async function validateField(field: string, password: string, setError: React.Dispatch<React.SetStateAction<IError[]>>): Promise<void> {

        let msg: string = "";
        let p_msg: string = "";

        let l_email = "";
        let l_phone = "";
        let l_username = "";

        const numbersAndDashesRegex = /^[0-9-]+$/;

        // Is password empty?
        if (password === "") p_msg = "Cannot leave password empty.";

        // Is field empty?
        if (field === "") msg = "Cannot leave field empty.";

        // Figure out what type the first field is (phone, email, or username) then validate
        else if (field.includes('@')) { // Email?

            // Confirm valid email
            if (!isEmail(field)) msg = "Please enter a valid email.";

            // Set email
            l_email = field;
        }

        // Is Phone?
        else if (numbersAndDashesRegex.test(field)) {

            // Confirm valid phone
            if (!isPhone(field)) msg = "Please enter a valid phone number.";

            // Set phone
            l_phone = field;

        }

        // Must be a username
        else {

            // Confirm valid username
            if (field.includes(' ')) msg = "Please enter a valid username.";

            // Set username
            l_username = field;

        }

        // Attempt to login if no errors
        if (msg === "" && p_msg === "") {
            let success = await login(l_email.toLowerCase(), l_phone, l_username.toLowerCase());

            if (success?.data.message === "Login Successful.") {
                alert("successfully logged in!");
                return;
            }

            // If error, set error messages
            msg = "Incorrect email or password."
            p_msg = msg;
        }

        // Input
        const err: IError = {message: msg, type: "Input"};
        setError(prevState => [...prevState, err]);

        // Password
        const p_err: IError = {message: p_msg, type: "Input Password"};
        setError(prevState => [...prevState, p_err]);
    }

    function isPhone(phone: string): boolean {
        const phoneRegex = /^(?:\d{10}|\d{3}[-\s]?\d{3}[-\s]?\d{4})$/;

        return phoneRegex.test(phone);
    }

    function isEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return emailRegex.test(email);
    }

    async function validateEmail(email : string, setError: React.Dispatch<React.SetStateAction<IError[]>>) {

        let msg : string = "";

        // Check if empty
        if (email === "") msg = "Please enter a email address.";

        // Check if is email address
        else if (!isEmail(email)) msg = "Please enter a valid email address.";

        // Check if taken
        else if ((await checkIfExist("", email))) msg = "This email address is already taken."

        // Return if no error
        else return false;

        const err : IError = {message: msg, type: "Email"};
        setError(prevState => [...prevState, err]);

        return true;
    }

    async function validateUsername(username : string, setError: React.Dispatch<React.SetStateAction<IError[]>>) {

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
        else if ((await checkIfExist(username))) msg = "This username is already taken."

        // Return if no error
        else return false;

        const err : IError = {message: msg, type: "Username"};
        setError(prevState => [...prevState, err]);

        return true;
    }

    async function validatePhone(phone : string, setError: React.Dispatch<React.SetStateAction<IError[]>>) {
        let msg : string = "";

        if (phone === "") return;

        // Check if there are only numbers
        if (!isPhone(phone)) msg = "Please enter a valid phone number.";

        // Check if taken
        else if ((await checkIfExist("", "", phone))) msg = "This phone number is already taken."

        // Return if no error
        else return false;

        const err : IError = {message: msg, type: "Phone"};
        setError(prevState => [...prevState, err]);

        return true;
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
        else return false;

        const err : IError = {message: msg, type: "Password"};
        setError(prevState => [...prevState, err]);

        return true;

    }

    const login = async (email: string = "", phone: string = "", username: string = "") => {

        if (!email && !phone && !username) throw new Error("Requires email, username, or phone.");

        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/api/users/login/",
                { email: email, username: username, phone: phone, password: passwordLogin},
                { headers: { "Content-Type": "application/json" } }
            );

            alert("Response:" + response.data);
            return response;
        } catch (error) {
            alert("Error:" + error);
            return null;
        }
    };

    const checkIfExist = async (username : string = "", email : string = "", phone : string = "") => {

        if (username === "" && email === "" && phone === "") return false;

        // Check if they exist
        try {
            let response;

            if (username) {
                response = await axios.post(
                    "http://127.0.0.1:8000/api/users/",
                    { username: username},
                    { headers: { "Content-Type": "application/json" } }
                );
            }
            else if (email) {
                response = await axios.post(
                    "http://127.0.0.1:8000/api/users/",
                    { email: email},
                    { headers: { "Content-Type": "application/json" } }
                );
            }
            else {
                response = await axios.post(
                    "http://127.0.0.1:8000/api/users/",
                    { phone: phone},
                    { headers: { "Content-Type": "application/json" } }
                );
            }

            if (response && response.data.found_user) {
                return true;
            }
        }
        catch (e) {
            alert("Error:" + e);
            return false;
        }

        return false;
    }

    const register = async (email: string, username: string, password: string, user_type: string = "student", phone: string = "") => {

        if (!email && !username && !password) throw new Error("Requires email, username, and a password.");

        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/api/users/register/",
                { email: email, username: username, phone: phone, password: password, user_type: user_type },
                { headers: { "Content-Type": "application/json" } }
            );

            alert("Response:" + response.data);
            return response;
        } catch (error) {
            alert("Error:" + error);
            return null;
        }
    }

    const errorText = (error : IError | undefined) => {

        if (error === undefined || error.message === "") {
            return ""
        }

        return (
            <p className="font-poppins text-red-500 text-sm text-left self-start pl-5">
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
                                   className={`border ${writeError("Email", errorSignUp) == "" ? "border-gray-300" : "border-red-300"} rounded-lg px-5 py-2 w-[730px] focus:outline-none focus:ring-2 focus:ring-blue-500`}/>

                            {writeError("Email", errorSignUp)}
                        </div>

                        <div className="flex flex-row gap-3">

                            {/** Username **/}
                            <div className="flex flex-col gap-1">
                                <input type="text" placeholder="Username*" value={usernameSignUp} onChange={(e) => setUsernameSignUp(e.target.value)}
                                       className={`border ${writeError("Username", errorSignUp) == "" ? "border-gray-300" : "border-red-300"} rounded-lg px-5 py-2 w-[360px] focus:outline-none focus:ring-2 focus:ring-blue-500`}/>

                                {writeError("Username", errorSignUp)}
                            </div>

                            {/** Phone Number **/}
                            <div className="flex flex-col gap-1">
                                <input type="tel" maxLength={14} placeholder="Phone Number" value={phoneSignUp} onChange={(e) => setPhoneSignUp(e.target.value)}
                                       className={`border ${writeError("Phone", errorSignUp) == "" ? "border-gray-300" : "border-red-300"} rounded-lg px-5 py-2 w-[360px] focus:outline-none focus:ring-2 focus:ring-blue-500`}/>

                                {writeError("Phone", errorSignUp)}
                            </div>

                        </div>

                        <div className="flex flex-row gap-3">
                            {/** Password **/}
                            <div className="flex flex-col gap-1">
                                <div className="relative">
                                    <input
                                        id="password-signup"
                                        type={showPasswordSignUp ? "text" : "password"}
                                        placeholder="Password*"
                                        value={passwordSignUp} onChange={(e) => setPasswordSignUp(e.target.value)}
                                        className={`border ${writeError("Password", errorSignUp) == "" ? "border-gray-300" : "border-red-300"} rounded-lg w-[360px] px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                                        className={`border ${writeError("Confirm Password", errorSignUp) == "" ? "border-gray-300" : "border-red-300"} rounded-lg w-[360px] px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500`}
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

        function isFieldPhone() : boolean {
            return (/^[0-9-]+$/.test(recoveryField));
        }

        function checkIfDisabled() : boolean {

            const field = recoveryField;
            const isPhone: boolean = isFieldPhone();

            const phoneRegex = /^(\+?\d{1,3}[\s-]?)?(\(?\d{1,4}\)?[\s-]?)?\d{10,15}$/;
            const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

            // Disable if invalid
            if (isPhone && !phoneRegex.test(field)) return true;

            if (!isPhone && !emailRegex.test(field)) return true;

            // Disable if incorrect type
            if (selectedItem === "Email" && !isPhone) return true;

            return false;
        }

        const step1 = () => {
            return (
                <>
                    {/** Recovery Label & Dropdown Box **/}
                    <p className="font-poppins mt-2">Select what you wish to recover.</p>
                    <div className="relative w-64">

                        <button onClick={() => setShowRecoveryItems(!showRecoveryItems)} disabled={recoveryCode}
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
                        disabled={selectedItem === "Select Recovery Option" || recoveryCode}
                        onChange={(e) => setRecoveryField(e.target.value)}
                        className={`border rounded-lg px-5 py-2 w-[300px] focus:outline-none focus:ring-2 focus:ring-blue-500 
                                    ${selectedItem === "Select Recovery Option"
                            ? "border-gray-300 bg-gray-100 cursor-not-allowed"
                            : "border-blue-200 bg-white"}`}
                    />
            </>
            )
        }

        const step2 = () => {
            return (
                <>
                    <p className="font-poppins mt-2">Enter the verification code you received.</p>

                    {/** Input Box **/}
                    <input
                        type="text"
                        placeholder="Enter your vertification code"
                        onChange={(e) => setRecoveryCodeInput(e.target.value)}
                        className={`border rounded-lg px-5 py-2 w-[300px] focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                </>
            )
        }

        return (
            <div className="fixed z-10 inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center relative">

                    <h2 className="font-poppins text-xl font-semibold">Recovery Options</h2>

                    <div className="flex flex-col items-center gap-5">

                        {/** Recovery Label & Dropdown Box OR Recovery Code Verification**/}
                        {recoveryCode ? step2() : step1()}

                        <div className="flex flex-row gap-20">
                            {/** Next Button **/}
                            <button
                                className="border bg-blue-400 border-gray-300 rounded-lg px-4 py-2 hover:bg-blue-500 active:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white disabled:opacity-50 disabled:bg-gray-600 disabled:cursor-not-allowed"
                                disabled={(!recoveryCode && (selectedItem === "Select Recovery Option" || checkIfDisabled()) || (recoveryCode && (recoveryCodeInput === "")))}
                                onClick={() => {

                                    if (recoveryCode) {
                                        return
                                    }

                                    let e = recoveryField;
                                    let p = recoveryField;

                                    if (isFieldPhone()) e = "";
                                    else p = "";

                                    send_recovery_code(e, p);
                                    setRecoveryCode(true);
                                }}>
                                {recoveryCode ? "Verify Code" : 'Next'}
                            </button>

                            {/** Close Button **/}
                            <button
                                onClick={() => {
                                    setRecoveryField("");
                                    setRecoveryCode(false);
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

    const send_recovery_code = async (email: string, phone: string) => {

        // Send email
        if (phone === "") {

            try {
                const response = await axios.post(
                    "http://127.0.0.1:8000/api/recovery/email",
                    { emailTo: email, recoveryType: selectedItem},
                    { headers: { "Content-Type": "application/json" } }
                );

                //alert("Response:" + response.data);
                return response;
            } catch (error) {
                alert("Error:" + error);
                return null;
            }
        }

        // Send Phone
        else {

        }

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
                           className={`border ${writeError("Input", errorSignIn) == "" ? "border-gray-300" : "border-red-300"} rounded-lg px-5 py-2 w-[400px] focus:outline-none focus:ring-2 focus:ring-blue-500`}/>

                    {writeError("Input", errorSignIn)}
                </div>


                <div className="flex flex-col gap-1">
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={passwordLogin} onChange={(e) => setPasswordLogin(e.target.value)}
                            className={`border ${writeError("Input Password", errorSignIn) == "" ? "border-gray-300" : "border-red-300"} rounded-lg w-[400px] px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                        </button>
                    </div>

                    {writeError("Input Password", errorSignIn)}
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