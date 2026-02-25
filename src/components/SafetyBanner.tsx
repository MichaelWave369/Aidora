export function SafetyBanner() {
  return (
    <div className="card border-amber-300 bg-amber-50" data-testid="safety-banner">
      <p className="font-semibold">Meet safely</p>
      <ul className="list-disc ml-5 text-sm">
        <li>Meet in a public place.</li>
        <li>Bring a friend when possible.</li>
        <li>Never share sensitive info.</li>
      </ul>
      <p className="text-xs mt-2">Not for emergencies — call local services for urgent danger.</p>
    </div>
  );
}
