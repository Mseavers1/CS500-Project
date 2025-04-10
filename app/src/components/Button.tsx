interface ButtonProps {
    name: string;
    onClick: () => void;
    backgroundColor?: string;
    colorDif?: number;
    width?: number;
    px?: number;
    py?: number;
}

export default function Button({ name, onClick, backgroundColor = "blue-500", colorDif = 200, width = 100, px = 16, py = 8 }: ButtonProps) {

    const [color, shade] = backgroundColor.split('-');
    const hoverColor = `${color}-${parseInt(shade, 10) + colorDif}`;

    return (
        <button
            className={`bg-${backgroundColor} w-[${width}px] text-white rounded-lg hover:bg-${hoverColor} focus:outline-none transform transition-all duration-200 ease-in-out active:scale-90`}
            style={{
                paddingLeft: `${px}px`,
                paddingRight: `${px}px`,
                paddingTop: `${py}px`,
                paddingBottom: `${py}px`
            }}
            onClick={onClick}>
            {name}
        </button>
    )

}