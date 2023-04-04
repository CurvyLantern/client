import { useEffect, useState } from "react";
import { useEffectOnce } from "react-use";

const useHydrated = () => {
  const [state, setState] = useState(false);
  useEffect(() => {
    setState(true);
  }, []);
  return [state];
};

export default useHydrated;
