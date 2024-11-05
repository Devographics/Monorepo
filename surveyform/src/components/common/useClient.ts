import { useEffect, useState } from "react";

/**
 *
 * @returns true on the second client-render, when hydratation is done
 * false on server  and first client-render (for hydratation)
 */
export const useClient = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
};
