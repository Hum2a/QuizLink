import type { Player } from '../types';
import { FaTrophy, FaMedal } from 'react-icons/fa';
import { GiPodiumWinner } from 'react-icons/gi';

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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 0: return <FaTrophy color="#FFD700" size={24} />;
      case 1: return <FaTrophy color="#C0C0C0" size={22} />;
      case 2: return <FaTrophy color="#CD7F32" size={20} />;
      default: return <FaMedal color="#999" size={18} />;
    }
  };

  return (
    <div className="results-view">
      <h2><GiPodiumWinner /> Quiz Results</h2>

      <div className="leaderboard">
        {sortedPlayers.map((player, index) => (
          <div key={player.id} className="leaderboard-item">
            <span className="rank">{getRankIcon(index)}</span>
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
            <FaTrophy color="#FFD700" /> Congratulations {sortedPlayers[0].name}! <FaTrophy color="#FFD700" />
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

