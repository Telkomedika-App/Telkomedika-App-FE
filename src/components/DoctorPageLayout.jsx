import DoctorLoginHeader from "./DoctorLoginHeader";

const LoadingState = () => (
  <div className="flex-1 flex items-center justify-center">
    <div className="text-gray-600 text-lg">Loading...</div>
  </div>
);

const ErrorState = ({ error }) => (
  <div className="flex-1 flex items-center justify-center p-4">
    <div className="bg-red-100 border-l-4 border-red-600 text-red-700 px-6 py-4 rounded">
      {error}
    </div>
  </div>
);

export default function PageLayout({ children, loading, error }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DoctorLoginHeader />
      {loading && <LoadingState />}
      {error && <ErrorState error={error} />}
      {!loading && !error && children}
    </div>
  );
}