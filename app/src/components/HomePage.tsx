import {Eye, EyeOff} from "lucide-react";
import {useState} from "react";

function HomePage() {

    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="flex flex-col items-center justify-center">

            <div className="font-poppins font-bold text-6xl">
                M.A.P
            </div>

            <div className="font-poppins text-2xl">
                A Math Advancement Platform
            </div>

            <div className="font-poppins flex flex-col p-5 gap-4">
                <input type="text" placeholder="Email or Username"
                       className="border border-gray-300 rounded-lg px-5 py-2 w-[400px] focus:outline-none focus:ring-2 focus:ring-blue-500"/>

                <div className="relative w-full">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <a onClick={() => alert("Forgot Password clicked")}
                       className="text-blue-500 text-sm text-center hover:underline cursor-pointer">
                        Trouble Logging In?
                    </a>

                    <a onClick={() => alert("Forgot Password clicked")}
                       className="text-blue-500 text-sm text-center hover:underline cursor-pointer">
                        Sign Up
                    </a>
                </div>

                <button
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300">
                    Login
                </button>

            </div>


        </div>
    )
}

export default HomePage;