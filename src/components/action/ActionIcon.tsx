import { useState } from "react";
import { IconType } from "react-icons";
import { TbHeart, TbHeartBroken } from "react-icons/tb";
import { forwardRef } from "react";

interface ActionIconProps {
  mode?: "oneWay" | "bothWays";
  iconPositive?: IconType;
  iconNegative?: IconType;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  className?: string;
}

const ActionIcon = forwardRef<HTMLButtonElement, ActionIconProps>(
  (
    { iconNegative, iconPositive, onClick, mode = "bothWays", className },
    ref
  ) => {
    const [isTriggered, setIsTriggered] = useState(false);
    const IconPositive = iconPositive ?? TbHeart;
    const IconNegative = iconNegative ?? TbHeartBroken;
    if (mode === "oneWay") {
      return (
        <button
          ref={ref}
          onClick={(e) => {
            if (typeof onClick === "function") {
              onClick(e);
            }
          }}
          type="button"
          className="grid h-14 w-14 place-items-center rounded-full border-0 bg-gray-200 text-2xl text-gray-600 shadow-md outline-transparent"
        >
          <IconPositive />
        </button>
      );
    }

    return (
      <button
      ref={ref}
        onClick={(e) => {
          setIsTriggered(!isTriggered);
          if (typeof onClick === "function") {
            onClick(e);
          }
        }}
        type="button"
        className="grid h-14 w-14 place-items-center rounded-full border-0 bg-gray-200 text-2xl text-gray-600 shadow-md outline-transparent"
      >
        {isTriggered ? <IconNegative /> : <IconPositive />}
      </button>
    );
  }
);
ActionIcon.displayName = "ActionIcon";
export default ActionIcon;
