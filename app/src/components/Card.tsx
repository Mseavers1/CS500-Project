interface CardWrapperProps {
    name: string;
    children: React.ReactNode;
}

export const CardWrapper = ({ name, children }: CardWrapperProps) => (
    <div className="flex flex-col items-center bg-amber-100 p-5 shadow w-[400px] h-[400px]">
        <p className="font-bold text-xl text-black">{name}</p>
        <hr className="border-b border-black w-[100%]" />
        {children}
    </div>
);

