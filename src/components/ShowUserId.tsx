import { useMainStore } from "@/store/BaseStore";
import { useEffect, useState } from "react";

const Demo = () => {
  const userId = useMainStore((state) => state.userId);

  const [tempState, setTempState] = useState("");

  useEffect(() => {
    setTempState(userId);
  }, [userId]);

  return (
    <p className="bg-white p-5 text-center text-3xl text-black">
      user id : {tempState}
    </p>
  );
};

export { Demo };
