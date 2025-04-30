import { useUser } from './UserContext';
import LogoutButton from "./LogoutFunction";
import Button from "./Button";
import {useNavigate} from "react-router-dom";

export default function ProfilePage() {

    const { username, authorization } = useUser();
    const nav = useNavigate();

    return (
        <div className="min-h-screen flex flex-col justify-center items-center gap-5">
            <p className="text-2xl"> Hello {authorization} {username}! </p>

            <div className="flex flex-row gap-5">
                <Button name="Selector" onClick={() => {nav("/selector"); }} colorDif={100}/>
                {authorization === "admin" ? <Button name="Admin Pannel" width={130} colorDif={100} onClick={() => {nav("/admin")}} /> : ""}
            </div>
        </div>
    )
}