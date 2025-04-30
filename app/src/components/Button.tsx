import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";

interface ButtonProps {
    name: string;
    mathSymbol?: string;
    onClick: () => void;
    backgroundColor?: string;
    colorDif?: number;
    width?: number;
    px?: number;
    py?: number;
}

export default function Button({ name, onClick, mathSymbol = "", backgroundColor = "blue-500", colorDif = 200, width = 100, px = 16, py = 8 }: ButtonProps) {

    const [color, shade] = backgroundColor.split('-');
    const hoverColor = `${color}-${parseInt(shade, 10) + colorDif}`;

    return (
        <button
            className={`bg-${backgroundColor} w-[${width}px] z-40 text-white text-center rounded-lg hover:bg-${hoverColor} focus:outline-none transform transition-all duration-200 ease-in-out active:scale-90`}
            style={{
                width: `${width}px`,
                paddingLeft: `${px}px`,
                paddingRight: `${px}px`,
                paddingTop: `${py}px`,
                paddingBottom: `${py}px`,
                outline: 'none',
                zIndex: 10,
            }}
            onClick={onClick}>
            {mathSymbol === "" ? name : <>
                {name} <InlineMath math={mathSymbol} />
            </>}
        </button>
    )

}