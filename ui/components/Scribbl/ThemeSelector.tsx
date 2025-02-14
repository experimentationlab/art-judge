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
            label="Theme"
            placeholder="Select your favorite theme"
            classNames={{ value: "capitalize" }}
            selectedKeys={[selectedTheme]}
            onChange={handleSelection}
            selectionMode="single"
            disallowEmptySelection
            startContent={<FaPalette />}
            radius="none"
        >
            {themes.map((theme) => (
                <SelectItem key={theme.key} className="capitalize">
                    {theme.display}
                </SelectItem>
            ))}
        </Select>
    );
};
