import { useEffect, useState } from "react";
import { useBoundStore } from ".";

const useHydration = () => {
  const [hydrated, setHydrated] = useState(() => false);

  useEffect(() => {
    // Note: This is just in case you want to take into account manual rehydration.
    // You can remove the following line if you don't need it.
    const unsubHydrate = useBoundStore.persist.onHydrate(() =>
      setHydrated(false)
    );

    const unsubFinishHydration = useBoundStore.persist.onFinishHydration(() =>
      setHydrated(true)
    );

    setHydrated(useBoundStore.persist.hasHydrated());

    return () => {
      unsubHydrate();
      unsubFinishHydration();
    };
  }, []);

  return hydrated;
};
export default useHydration;
