interface Props { local: number; coevo?: number }
export function ReputationBadge({ local, coevo = 0 }: Props) {
  return <span className="text-xs rounded-full bg-teal-100 text-teal-700 px-2 py-1" data-testid="reputation-badge">Local Trust {local} · CoEvo {coevo}</span>;
}
