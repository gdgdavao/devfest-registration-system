import React from "react";

interface Props {
    title?: string;
    description?: string;
}

const Title: React.FC<Props> = ({ title, description }) => {
    return (
        <div className="flex flex-col items-center text-center space-y-2">
            <h3>{title}</h3>
            <p className="">{description}</p>
        </div>
    );
};

export default Title;
