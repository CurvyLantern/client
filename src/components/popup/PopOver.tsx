import React from "react";
// import * as Popover from "@radix-ui/react-popover";
import { TbDotsVertical } from "react-icons/tb";
import ActionIcon from "../action/ActionIcon";
import { Popover } from "@mantine/core";

const PopoverButton = () => {
  return (
    <Popover width={200} position="bottom" withArrow shadow="md">
      <Popover.Target>
        <ActionIcon iconPositive={TbDotsVertical} mode="oneWay" />
      </Popover.Target>
      <Popover.Dropdown className="rounded-md bg-white px-2 py-3 text-black shadow-md">
        Some more info…
        <span className="text-yellow-700">copy</span>
      </Popover.Dropdown>
    </Popover>
    // <Popover.Root>
    //   <Popover.Trigger asChild className="PopoverTrigger">
    //     {/* <ActionIcon iconPositive={TbDotsVertical} mode="oneWay" /> */}
    //     <Hellop />
    //   </Popover.Trigger>
    //   <Popover.Portal>
    //     <Popover.Content
    //       className="
    //   rounded-md bg-white px-2 py-3 text-black shadow-md
    //   "
    //       sideOffset={5}
    //     >
    //       Some more info…
    //       <span className="text-yellow-700">copy</span>
    //       <Popover.Arrow className="fill-white" />
    //     </Popover.Content>
    //   </Popover.Portal>
    // </Popover.Root>
  );
};

const Hellop = () => {
  return <button>hello</button>;
};
export default PopoverButton;
