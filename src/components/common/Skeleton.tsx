import { twMerge } from "tailwind-merge";

interface SkeletonProps {
  className?: string;
}

const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <div className={twMerge("animate-pulse bg-gray-200 rounded-xl", className)} />
  );
};

export default Skeleton;
