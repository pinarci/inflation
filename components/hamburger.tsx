"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Menu, Landmark, Apple, Users2 } from "lucide-react";

export default function Hamburger() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="w-[35px] h-[35px] inline-flex items-center justify-center"
          aria-label="Hamburger"
        >
          <Menu />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[200px] rounded-b-md p-[5px] bg-secondary"
          sideOffset={11}
        >
          <DropdownMenu.Label className="pl-[10px] select-none text-xs font-bold leading-[25px]">
            GAMES
          </DropdownMenu.Label>
          <DropdownMenu.Item
            asChild
            className="group leading-none rounded-[3px] flex items-center h-[35px] px-[5px] relative pl-[10px] select-none outline-none data-[highlighted]:bg-primary data-[highlighted]:text-secondary"
          >
            <a href="/" className="justify-between">
              Central Banking <Landmark className="h-4 w-4" />
            </a>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            asChild
            className="group leading-none rounded-[3px] flex items-center h-[35px] px-[5px] relative pl-[10px] select-none outline-none data-[highlighted]:bg-primary data-[highlighted]:text-secondary"
          >
            <a href="/public" className="justify-between">
              Public Goods <Users2 className="h-4 w-4" />
            </a>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            asChild
            className="group leading-none rounded-[3px] flex items-center h-[35px] px-[5px] relative pl-[10px] select-none outline-none data-[highlighted]:bg-primary data-[highlighted]:text-secondary"
          >
            <a href="/apple" className="justify-between">
              Velocity of Money <Apple className="h-4 w-4" />
            </a>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="h-[1px] bg-primary m-[5px]" />
          <DropdownMenu.Item className="flex items-center text-xs h-[35px] pl-[10px] select-none outline-none">
            Privacy Policy
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
