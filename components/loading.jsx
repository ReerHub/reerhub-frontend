const Loading = ({ text = "Loading..." }) => {
  return (
    <div className="w-full flex justify-center items-center h-screen">
      <p className="text-gray-600 dark:text-[#94A3B8] text-lg">{text}</p>
    </div>
  );
};

export default Loading;
