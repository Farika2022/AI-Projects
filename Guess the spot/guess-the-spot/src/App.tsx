import Scene from './components/Scene'
import ScoreCounter from './components/ScoreCounter'
import QuestionModal from './components/QuestionModal'
import StartScreen from './components/StartScreen'
import FinishOverlay from './components/FinishOverlay'
import Timer from './components/Timer'
import { locations } from './data/locations'
import { useGame } from './hooks/useGame'

export default function App() {
  const game = useGame()
  const { phase, selected, outcome } = game

  return (
    <div className="h-full w-full">
      <Scene
        answeredIds={game.answeredIds}
        paused={selected !== null || phase === 'finished'}
        disabled={phase !== 'playing' || game.isLastQuestion}
        onSelectLocation={game.selectLocation}
      />

      {phase === 'start' && (
        <StartScreen
          nickname={game.nickname}
          questions={game.total}
          totalLocations={locations.length}
          onStart={game.startGame}
        />
      )}

      {phase === 'playing' && (
        <ScoreCounter
          nickname={game.nickname}
          answered={game.answeredIds.length}
          score={game.score}
          total={game.total}
        />
      )}

      {selected && outcome === null && (
        <Timer
          key={`${selected.id}-${game.stage}`}
          label={game.stage === 'puzzle' ? '🧩' : '⏱'}
          startedAt={game.startedAt}
          limitMs={game.timeLimitMs}
          onExpire={game.timeout}
        />
      )}

      {selected && game.question && (
        <QuestionModal
          key={selected.id}
          location={selected}
          mode={game.mode}
          stage={game.stage}
          question={game.question}
          fact={game.fact}
          tileOrder={game.tileOrder}
          puzzleOutcome={game.puzzleOutcome}
          chosenAnswer={game.chosenAnswer}
          outcome={outcome}
          isLastQuestion={game.isLastQuestion}
          onReady={game.startTimer}
          onPuzzleDone={game.finishPuzzle}
          onAnswer={game.answer}
          onNext={game.next}
        />
      )}

      {phase === 'finished' && (
        <FinishOverlay
          nickname={game.nickname}
          mode={game.mode}
          quote={game.quote}
          score={game.score}
          total={game.total}
          puzzleTimeMs={game.puzzleTimeMs}
          quizTimeMs={game.quizTimeMs}
          onPlayAgain={game.playAgain}
        />
      )}
    </div>
  )
}
