import React from 'react';
import './App.css';

import HomePage from "./components/HomePage";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TopicSelector from "./components/TopicSelector";
import QuestionSolver from "./components/QuestionSolver";

function App() {

    const header = () => {
        return (
            <div className="fixed flex top-0 left-0 right-0 p-3 w-full bg-primary_bars">

            </div>
        )
    }

    const footer = () => {
        return (
            <div className="fixed flex bottom-0 left-0 right-0 p-3 w-full bg-primary_bars">

            </div>
        )
    }

    function has_scrolled() : boolean {
        return window.scrollY > 50;
    }

    return (
        <Router>
            <div className="bg-gradient-to-b from-blue-100 to-white h-screen bg-background">

                {/** Header **/}
                {has_scrolled() ? header() : ""}

                {/** Body (Pages) **/}
                <div className="flex justify-center items-center h-full p-5">
                    <Routes>
                        <Route path="/" element={<HomePage/>}/>
                        <Route path="/selector" element={<TopicSelector/>}/>
                        <Route path="/solve" element={<QuestionSolver/>}/>
                    </Routes>
                </div>

                {/** Footer **/}
                {has_scrolled() ? footer() : ""}

            </div>
        </Router>
    )
}

export default App;
