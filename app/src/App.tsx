import React, {useEffect, useState} from 'react';
import './App.css';

import HomePage from "./components/HomePage";
import {BrowserRouter as Router, Routes, Route, useNavigate} from 'react-router-dom';
import TopicSelector from "./components/TopicSelector";
import QuestionSolver from "./components/QuestionSolver";
import ProfilePage from "./components/ProfilePage";
import {ProtectedRoute} from "./components/ProtectedRoute";
import AdminPanelPage from "./components/AdminPanelPage";

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
        <div className="bg-gradient-to-b from-blue-100 to-white h-screen bg-background font-poppins">

            {/** Header **/}
            {has_scrolled() ? header() : ""}

            {/** Body (Pages) **/}
            <div className="flex justify-center items-center h-full p-5">
                <Routes>
                    <Route path="/" element={<HomePage/>}/>
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <ProfilePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/selector"
                        element={
                            <ProtectedRoute>
                                <TopicSelector />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/solve"
                        element={
                            <ProtectedRoute>
                                <QuestionSolver />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute auth="admin">
                                <AdminPanelPage />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </div>

            {/** Footer **/}
            {has_scrolled() ? footer() : ""}

        </div>
    )
}

export default App;
