"use client";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@heroui/react";
import Image from "next/image";
import Link from "next/link";
import { FC, useState } from "react";
import { ConnectButton } from "../Wallet/Connect";

const menuItems = [
  { path: "/", name: "Home" },
  { path: "/leaderboard", name: "Leaderboard" },
];

const MenuItem: FC<{ path: string; name: String }> = ({ path, name }) => (
  <Link href={path}>{name}</Link>
);

const Header: FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Navbar isBordered isMenuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen}>
      <NavbarMenuToggle
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        className="sm:hidden"
      />
      <NavbarBrand>
        <Image
          src="/scribbl-logo.png"
          alt="Scribbl app logo!"
          priority={true}
          width={80}
          height={80}
        />
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {menuItems.map((item, index) => (
          <NavbarItem key={`${item.name}-${index}`}>
            <Link color="foreground" href={item.path} className="uppercase">
              {item.name}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem>
          <ConnectButton />
        </NavbarItem>
      </NavbarContent>
      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem
            key={`menu-item-${item.name}-${index}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <Link className="w-full" color="foreground" href={item.path}>
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
};

export default Header;
