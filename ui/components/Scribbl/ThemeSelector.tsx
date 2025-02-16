import { Select, SelectItem } from "@heroui/react";
import { ChangeEvent, FC } from "react";
import { FaPalette } from "react-icons/fa";
import { ValidThemes, themes } from "./themes";

interface Props {
    selectedTheme: ValidThemes;
    onValueChange: (val: ValidThemes) => void;
}

export const ThemeSelector: FC<Props> = ({ selectedTheme, onValueChange }) => {
    const handleSelection = (evt: ChangeEvent<HTMLSelectElement>) => {
        onValueChange(evt.target.value as ValidThemes);
    };

    return (
        <Select
            label="Theme Selector"
            description={
                <span className="bold text-primary-700 text-xl">
                    Click and select a theme you like.
                </span>
            }
            size="sm"
            placeholder="Select your favorite theme"
            classNames={{ value: "capitalize" }}
            selectedKeys={[selectedTheme]}
            onChange={handleSelection}
            selectionMode="single"
            variant="faded"
            scrollShadowProps={{}}
            disallowEmptySelection
            startContent={<FaPalette />}
        >
            {themes.map((theme) => (
                <SelectItem key={theme.key} className="capitalize">
                    {theme.display}
                </SelectItem>
            ))}
        </Select>
    );
};
