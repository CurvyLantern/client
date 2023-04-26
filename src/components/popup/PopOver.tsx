import React from "react";
import * as Popover from "@radix-ui/react-popover";
import { TbDotsVertical } from "react-icons/tb";
import ActionIcon from "../action/ActionIcon";

const PopoverButton = () => {
  return (
    <Popover.Root>
      <Popover.Trigger className="PopoverTrigger">
        <ActionIcon iconPositive={TbDotsVertical} mode="oneWay" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="
      rounded-md bg-white px-2 py-3 text-black shadow-md
      "
          sideOffset={5}
        >
          Some more info…
          <span className="text-yellow-700">copy</span>
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default PopoverButton;
