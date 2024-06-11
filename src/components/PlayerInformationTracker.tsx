import Image from "next/image";

function PlayerGoldTracker({ playerName, gold, nameAdjustmentFunction } : {playerName: string, gold: number, nameAdjustmentFunction: (name: string) => void}){
  let textSize = "text-4xl"

  if(playerName.length > 9) textSize = "text-2xl"
  if(playerName.length > 14) textSize = "text-lg"

  return (
    <div className="bg-teal-900 w-60 h-full flex flex-col text-center gap-4 border-solid border-black border-2">
      <div className="flex flex-row gap-1 text-center items-center justify-center">
          <Image
            src="/icons/Gold_symbol.webp"
            alt="Gold Symbol"
            width={18}
            height={18}
            priority
          />
        <span className="text-4xl text-transparent bg-clip-text bg-gradient-to-b from-zinc-600 via-amber-300 to-amber-950">{ gold }</span>
      </div>
      <input className={"bg-transparent text-center m-6 mt-2 " + textSize } value={ playerName } onChange={e => nameAdjustmentFunction(e.target.value)}/>
    </div>
  )
}

function EmptyPlayerGoldTracker(){
  let textSize = "text-4xl"
  const name = "Player1Loading"
  const gold = 0

  return (
    <div className="bg-teal-900 w-60 h-full flex flex-col text-center gap-4 border-solid border-black border-2">
      <div className="flex flex-row gap-1 text-center items-center justify-center">
          <Image
            src="/icons/Gold_symbol.webp"
            alt="Gold Symbol"
            width={18}
            height={18}
            priority
          />
        <span className="text-4xl text-transparent bg-clip-text bg-gradient-to-b from-zinc-600 via-amber-300 to-amber-950">{ gold }</span>
      </div>
      <input className={"bg-transparent text-center m-6 mt-2 " + textSize } value={ name } disabled={true}/>
    </div>
  )
}

export default function PlayerInformationTracker({ playerArray, nameAdjustmentFunction } : { playerArray: Array<any>, nameAdjustmentFunction: (name: string) => void }) {
  const playerTrackers = playerArray.map((playerObject, index) => 
    <PlayerGoldTracker key={"player_" + index} playerName={playerObject.name} gold={playerObject.gold} nameAdjustmentFunction={nameAdjustmentFunction}/>
  )
  return (
    <div className="w-screen flex flex-row text-center gap-4 justify-center items-center">
      {playerTrackers}
    </div>
  )
}