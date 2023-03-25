const user = [1];
const Screen = () => {
  return (
    <div className="flex h-full  flex-col items-center justify-center">
      <div
        className={`grid h-full w-full grid-cols-1 items-center justify-center  gap-4  p-2 md:grid-cols-${user.length} lg:grid-cols-${user.length}`}
      >
        {user.map((items) => (
          <>
            <video
              src=""
              autoPlay
              controls
              playsInline
              className={`mx-auto ${user.length > 1 ? "w-full" : "w-1/2"}  `}
            ></video>
          </>
        ))}
      </div>
    </div>
  );
};

export default Screen;
