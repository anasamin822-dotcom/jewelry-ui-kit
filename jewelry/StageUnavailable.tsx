export function StageUnavailable() {
  return (
    <p className="js-loading">3D preview unavailable. Try another piece.</p>
  );
}
export function StageError({ message }: { message: string }) {
  return (
    <p className="js-sdk-error" role="alert">
      {message}
    </p>
  );
}
