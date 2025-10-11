const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen min-w-screen h-full w-full items-center justify-center  flex flex-col">
    {children}
    </div>
  );
};

export default layout;
