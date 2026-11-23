export default function Loading() {
  return (
    <div aria-busy="true">
      <div className="h-3 w-32 bg-line" />
      <div className="mt-4 h-9 w-72 bg-line" />
      <div className="mt-8 h-48 border border-line bg-white" />
      <span className="sr-only">Loading</span>
    </div>
  );
}
