import gdgLogo from "@/assets/gdg_logo.png";

export default function Footer() {
    return (
        <div className="flex flex-col items-center py-12">
            <img src={gdgLogo} alt="GDG Davao" className="w-full max-w-[10rem] h-auto mb-2" />
            <p className="text-gray-800 mb-4">&copy; 2023 Google Developer Group Davao</p>

            <ul className="flex space-x-2">
                <li><a className="text-gray-500 hover:text-gray-600 underline" href="https://policies.google.com/privacy">Google Privacy Policy</a></li>
                {import.meta.env.VITE_FEEDBACK_URL &&
                    <li><a className="text-gray-500 hover:text-gray-600 underline" href={import.meta.env.VITE_FEEDBACK_URL}>Submit a Feedback</a></li>}
            </ul>
        </div>
    );
}
