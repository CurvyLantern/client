const user = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const TuhinPage = () => {
  return (
    <div className="m-4 flex min-h-screen flex-row items-center justify-center gap-5 overflow-hidden">
      <div
        className={` flex ${
          user.length === 1 ? "w-1/2" : "w-full "
        }  gap-5 md:grid-cols-2 lg:grid-cols-3`}
      >
        {user.map((item) => (
          <video key={item} className={`w-full `} src="" controls></video>
        ))}
      </div>
    </div>
  );
};

export default TuhinPage;
