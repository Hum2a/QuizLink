import type { Player } from '../types';

interface ResultsViewProps {
  players: Player[];
  isAdmin: boolean;
  onReset: () => void;
}

function ResultsView({ players, isAdmin, onReset }: ResultsViewProps) {
  // Sort players by score (descending), exclude admins
  const sortedPlayers = [...players]
    .filter(p => !p.isAdmin)
    .sort((a, b) => b.score - a.score);

  const getEmoji = (rank: number) => {
    switch (rank) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '🎯';
    }
  };

  return (
    <div className="results-view">
      <h2>🎊 Quiz Results</h2>

      <div className="leaderboard">
        {sortedPlayers.map((player, index) => (
          <div key={player.id} className="leaderboard-item">
            <span className="rank">{getEmoji(index)}</span>
            <div className="player-result">
              <span className="name">{player.name}</span>
              <span className="score">{player.score} pts</span>
            </div>
          </div>
        ))}
      </div>

      {sortedPlayers.length > 0 && (
        <div className="results-winner">
          <h3>
            🎉 Congratulations {sortedPlayers[0].name}! 🎉
          </h3>
        </div>
      )}

      {isAdmin && (
        <button 
          className="submit-button"
          onClick={onReset}
        >
          Play Again
        </button>
      )}

      {!isAdmin && (
        <p className="results-waiting">
          Waiting for host to start a new game...
        </p>
      )}
    </div>
  );
}

export default ResultsView;

