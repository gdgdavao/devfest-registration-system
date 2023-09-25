import React from "react";
import Title from "../Title";

interface Props {
    userType: "Student" | "Professional";
}

const Profile: React.FC<Props> = ({ userType }) => {
    return (
        <div className="flex flex-col items-center space-y-4">
            <Title
                // title={`${userType} profile`}
                title="Participant profile"
                description="Rorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis."
            />
        </div>
    );
};

export default Profile;
