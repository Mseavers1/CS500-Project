import React from 'react';
import './App.css';

import HomePage from "./components/HomePage";

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
        <div className="bg-gradient-to-b from-blue-100 to-white h-screen bg-background">

            {/** Header **/}
            {has_scrolled() ? header() : ""}

            {/** Body **/}
            <div className="flex justify-center items-center h-full">
                <HomePage/>
            </div>

            {/** Footer **/}
            {has_scrolled() ? footer() : ""}

        </div>
    )
}

export default App;
