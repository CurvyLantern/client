import { useState } from "react";
import { IconType } from "react-icons";
import { TbHeart, TbHeartBroken } from "react-icons/tb";

interface ActionIconProps {
  mode?: "oneWay" | "bothWays";
  iconPositive?: IconType;
  iconNegative?: IconType;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const ActionIcon: React.FC<ActionIconProps> = ({
  iconNegative,
  iconPositive,
  onClick,
  mode = "bothWays",
}) => {
  const [isTriggered, setIsTriggered] = useState(false);
  const IconPositive = iconPositive ?? TbHeart;
  const IconNegative = iconNegative ?? TbHeartBroken;
  if (mode === "oneWay") {
    return (
      <button
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
};
export default ActionIcon;
