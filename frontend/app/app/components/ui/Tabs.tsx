import { useState, type ReactNode } from "react";

type TabProps = {
    title: string;
    children: ReactNode;
};

type TabsProps = {
    children: React.ReactElement<TabProps>[];
};

export function Tab({ children }: TabProps) {
    return <>{children}</>;
}

export function Tabs({ children }: TabsProps) {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div className="w-full">
            {/* Заголовки */}
            <div className="flex border-b">
                {children.map((tab, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => setActiveTab(index)}
                        className={`
                            px-4 py-2
                            border-b-2
                            transition-colors
                            ${
                                activeTab === index
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            }
                        `}
                    >
                        {tab.props.title}
                    </button>
                ))}
            </div>

            {/* Содержимое */}
            <div className="pt-4">
                {children[activeTab]}
            </div>
        </div>
    );
}