import { useMainStore } from "@/store/BaseStore";
import { usePeerStore } from "@/store/PeerStore";
import { useEffect, useState } from "react";

const Demo = () => {
  const userId = usePeerStore((state) => state.userId);

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
