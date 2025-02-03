import React from 'react';
import './App.css';

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

    return (
        <div className="h-screen">

            {/** Header **/}
            {header()}

            {/** Body **/}
            <div className="flex justify-center items-center h-full bg-background">

            </div>

            {/** Footer **/}
            {footer()}

        </div>
    )
}

export default App;
