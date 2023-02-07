import { AspectRatio } from "@mantine/core";

const ActionButtonParent = ({ children }: { children: JSX.Element }) => {
  return (
    <AspectRatio ratio={1} className="w-12">
      {children}
    </AspectRatio>
  );
};
export { ActionButtonParent };
