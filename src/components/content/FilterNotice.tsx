interface FilterNoticeProps {
  message: string | null;
  isVisible: boolean;
}

export default function FilterNotice({ message, isVisible }: FilterNoticeProps) {
  return (
    <div
      className={`grid transition-all duration-500 ease-out delay-200 ${
        isVisible ? "grid-rows-[1fr] mb-4" : "grid-rows-[0fr]"
      }`}
    >
      <div className="overflow-hidden">
        <div
          className={`min-h-[40px] rounded-md bg-green-200 border-solid border-green-400 border-b-2 px-4 py-2 text-sm text-primary shadow-sm transition-opacity duration-500 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          {message}
        </div>
      </div>
    </div>
  );
}