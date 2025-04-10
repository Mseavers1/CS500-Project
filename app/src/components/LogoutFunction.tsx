import {useUser} from "./UserContext";
import {NavigateFunction} from "react-router-dom";
import Button from "./Button";

export default function LogoutButton() {
    const { setUsername } = useUser();
    //nav("/");

    const onLogout = () => {
        localStorage.setItem('username', "");
        setUsername("");
    }

    return (
        <Button name={"Logout"} onClick={onLogout} backgroundColor={"red-500"}/>
    )
}