import Button from "./Button";

export default function AdminPanelPage() {

    interface CardProps {
        name: string;
        items: string[];
    }

    const Card = (props: CardProps) => {

        return (
            <div className="flex flex-col items-center bg-amber-100 p-5 shadow min-w-[250px] min-h-[300px]">

                <p className="font-bold text-xl text-black"> {props.name} </p>
                <hr className="border-b border-black w-[100%]"/>

                <div className="flex flex-col items-center bg-white p-5 mt-5 gap-3">
                    {props.items.map((item, idx) => (
                        <div className="flex flex-row gap-5 items-center">
                            <p key={idx}>{item}</p>
                            <Button name="X" onClick={() => {}} backgroundColor="red-500" width={5} px={8} py={2}/>
                        </div>
                    ))}
                </div>


            </div>
        )
    }

    return (
        <div className="flex flex-col justify-center text-center gap-5">

            <p className="text-[40px]"> Admin Panel </p>

            <div className="flex flex-row items-center justify-center gap-10">
                <Card name="Topics" items={["Algebra", "Calc"]}/>
                <Card name="Question Types" items={["System of Equations", "Linear Equations", "Integrals"]}/>
                <Card name="Questions" items={[]}/>
            </div>
        </div>
    )
}