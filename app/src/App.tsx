import './App.css';

import HomePage from "./components/HomePage";
import {Routes, Route, useLocation, useNavigate} from 'react-router-dom';
import TopicSelector from "./components/TopicSelector";
import QuestionSolver from "./components/QuestionSolver";
import ProfilePage from "./components/ProfilePage";
import {ProtectedRoute} from "./components/ProtectedRoute";
import AdminPanelPage from "./components/AdminPanelPage";
import {useEffect, useRef, useState} from "react";
import {useUser} from "./components/UserContext";
import Button from "./components/Button";
import TermAnimator, {term} from "./components/term_animator";

function App() {

    const location = useLocation();
    const nav = useNavigate();
    const [terms, setTerms] = useState<term[]>([]);
    const {username, setUsername, authorization} = useUser();

    useEffect(() => {
        if (location.pathname === "/") {
            document.body.style.overflowY = "auto";
        } else {
            document.body.style.overflowY = "hidden";
        }

        return () => {
            document.body.style.overflowY = "auto";
        }
    }, [location.pathname]);

    useEffect(() => {
        fetch('./data/math_terms.txt')
            .then((response) => response.text())
            .then((data) => {
                const termsArray = data.split('\n').filter(t => t.trim() !== '');
                const loadedTerms = termsArray.map((term, index) => ({ id: index, name: term }));
                setTerms(loadedTerms);
            })
            .catch((error) => console.error('Error fetching the file:', error));
    }, []);


    const header = () => {
        return (
            <div className="fixed flex flex-row items-center top-0 justify-between right-0 p-3 z-20 w-full text-white bg-primary_bars">
                <p className="font-nunito text-2xl select-none"> M.A.P - A Math Advancement Platform </p>
                <div className="flex flex-row items-center justify-center gap-5">
                    <Button name="Dashboard" backgroundColor="transparent" onClick={() => {nav("/dashboard");}}/>
                    {authorization === "admin" ? <Button name="Admin" width={65} backgroundColor="transparent" onClick={() => {nav("/admin");}}/> : ""}
                    <Button name="Selector" backgroundColor="transparent" onClick={() => {nav("/selector");}}/>
                    <ProfilePicture/>
                </div>
            </div>
        )
    }

    const footer = () => {
        return (
            <div className="fixed flex bottom-0 left-0 right-0 p-3 w-full bg-primary_bars">

            </div>
        )
    }

    function ProfilePicture() {
        const [showProfilePanel, setShowProfilePanel] = useState(false);
        const containerRef = useRef<HTMLDivElement>(null);

        const togglePanel = () => {
            setShowProfilePanel(prev => !prev);
        };

        function getGreeting() {

            const hour = new Date().getHours();
            let greeting = ""

            if (hour < 12) greeting = "Good morning"
            else if (hour < 18) greeting = "Good afternoon"
            else greeting = "Good evening"

            return greeting;
        }

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (
                    containerRef.current &&
                    !containerRef.current.contains(event.target as Node)
                ) {
                    setShowProfilePanel(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }, []);

        const onLogout = () => {
            localStorage.setItem('username', "");
            setUsername("");
        }

        return (
            <div ref={containerRef} className="relative flex items-center justify-center">
                <img
                    src="/images/profile.webp"
                    alt="Profile"
                    onClick={togglePanel}
                    className="w-10 h-10 rounded-full object-cover border-[1px] border-black shadow-md cursor-pointer select-none"
                />

                {showProfilePanel && (
                    <div className="absolute right-0 top-12 w-[250px] bg-white text-black rounded-lg shadow-lg select-none z-50">
                        <div className="px-4 py-2 border-b flex flex-wrap items-center gap-1">
                            <span>{getGreeting()},</span>
                            <span className="text-red-400 font-semibold">{username}</span>
                            <span className="-ml-1">!</span>
                        </div>

                        <button className="w-full text-left px-4 py-2 hover:bg-gray-100">Settings</button>
                        <button className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-100"
                                onClick={() => {onLogout()}}>Logout</button>
                    </div>
                )}
            </div>
        );
    }

    function showHeader() {

        let showHeader = false;

        if (location.pathname != "/") showHeader = true;

        return (
            showHeader ? header() : ""
        )
    }

    return (
        <div className="min-h-screen font-poppins">

            <div
                className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-100 to-white"
                style={{zIndex: -2}}
            ></div>

            {/* Term Animator */}
            <TermAnimator terms={terms}/>

            {/* Header */}
            {showHeader()}

            {/* Body */}
            <div className="p-5" style={{zIndex: 10}}>
                <Routes>
                    <Route path="/" element={<HomePage/>}/>
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <ProfilePage/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/selector"
                        element={
                            <ProtectedRoute>
                                <TopicSelector/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/solve"
                        element={
                            <ProtectedRoute>
                                <QuestionSolver/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute auth="admin">
                                <AdminPanelPage/>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </div>

            {/* Footer */}
            {location.pathname != "/" ? footer() : ""}

        </div>
    )

}

export default App;
