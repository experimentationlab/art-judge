import { FC, ReactNode } from "react";

export const PageLayout: FC<{ children: ReactNode; title: string }> = ({ children, title }) => {
    return (
        <div className="flex flex-col items-center sm:items-center justify-center mt-[1rem] md:mt-[3rem] ">
            <h1 className="text-4xl md:text-5xl pb-5 md:pb-12 uppercase text-primary-700 text-nowrap">
                {title}
            </h1>
            {children}
        </div>
    );
};
