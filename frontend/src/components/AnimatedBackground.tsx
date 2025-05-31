'use client';


const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 h-full w-full bg-white dark:bg-gray-950">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-purple-500 opacity-20 blur-[100px]"></div>
    </div>
  );
};

export default AnimatedBackground; 