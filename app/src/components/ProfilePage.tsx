import { useUser } from './UserContext';
import LogoutButton from "./LogoutFunction";

export default function ProfilePage() {

    const { username } = useUser();

    return (
        <div className="flex flex-col">
            Hello {username}!

            <LogoutButton />
        </div>
    )
}