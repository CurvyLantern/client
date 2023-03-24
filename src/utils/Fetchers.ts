export const roomFetcher = () => {
  return fetch("/api/v1/getNewRoom").then<{
    roomId: string;
  }>((res) => res.json());
};
type Data =
  | {
      roomState: "available" | "unavailable";
    }
  | {
      message: string;
    };
export const roomAvailabilityFetcher = (roomId: string) => {
  return fetch(`/api/v1/checkRoom`, {
    body: JSON.stringify({
      roomId,
    }),
    method: "POST",
  }).then<Data>((response) => response.json());
};
