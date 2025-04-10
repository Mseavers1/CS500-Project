import { useUser } from './UserContext';
import LogoutButton from "./LogoutFunction";
import Button from "./Button";
import {useNavigate} from "react-router-dom";

export default function ProfilePage() {

    const { username, authorization } = useUser();
    const nav = useNavigate();

    return (
        <div className="flex flex-col">
            Hello {username} of type {authorization}!

            <Button name="Selector" onClick={() => {nav("/selector"); }} colorDif={100}/>
            <LogoutButton />
            {authorization === "admin" ? <Button name="Admin Pannel" onClick={() => {}} /> : ""}
        </div>
    )
}