"use client";
import { FC } from "react";
import { Hex } from "viem";

const shortenText = (value: string) =>
    `${value.slice(0, 5)}...${value.slice(-3)}`;

interface Props {
    address: Hex;
    shorten?: boolean;
}

const Address: FC<Props> = ({ address, shorten = true }) => {
    const text = shorten ? shortenText(address) : address;
    return <span>{text}</span>;
};

export default Address;
