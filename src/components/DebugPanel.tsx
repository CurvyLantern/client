import { useBoundStore } from "@/store";
import { useEffect, useState } from "react";

const DebugPanel = () => {
  const userId = useBoundStore((state) => state.userId);

  const [data, setData] = useState<Array<{ label: string; value: any }>>([]);

  useEffect(() => {
    setData((prev) => [...prev, { label: "userId", value: JSON.stringify(userId) }]);
  }, [userId]);
  useEffect(() => {
    console.log(userId, "from effect");
  });
  // const data: Array<{ label: string; value: any }> = [];
  // data.push({ label: "userId", value: userId });
  return (
    <div className="fixed top-0 right-0 w-52 bg-black bg-opacity-60 p-5 text-sm text-white backdrop-blur-md">
      <table>
        <thead>
          <th>
            <td>label</td>
            <td>value</td>
          </th>
        </thead>
        <tbody>
          {/* {data.map((item, idx) => {
            return (
              <tr key={idx}>
                <td>{item.label}</td>
                <td>{JSON.stringify(item.value)}</td>
              </tr>
            );
          })} */}
        </tbody>
      </table>
      {/* <p className="bg-white p-5 text-center text-3xl text-black">
        user id : {tempState}
      </p> */}
    </div>
  );
};

export { DebugPanel };
