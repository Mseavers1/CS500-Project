interface ButtonProps {
    name: string;
    onClick: () => void;
    backgroundColor?: string; // Optional backgroundColor with default value
}

export default function Button({ name, onClick, backgroundColor = "blue-500" }: ButtonProps) {

    const [color, shade] = backgroundColor.split('-');
    const hoverColor = `${color}-${parseInt(shade, 10) + 200}`;

    return (
        <button
            className={`px-4 py-2 bg-${backgroundColor} w-[100px] text-white rounded-lg hover:bg-${hoverColor} focus:outline-none transform transition-all duration-200 ease-in-out active:scale-90`}
            onClick={onClick}>
            {name}
        </button>
    )

}