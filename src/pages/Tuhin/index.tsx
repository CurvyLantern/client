const user = [1, 2];
const TuhinPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto my-10 grid max-w-7xl grid-cols-1 gap-14 md:grid-cols-2 lg:grid-cols-4">
        {user.map((item) => (
          <video key={item} src="" className="w-full" controls></video>
        ))}
      </div>
    </div>
  );
};

export default TuhinPage;
