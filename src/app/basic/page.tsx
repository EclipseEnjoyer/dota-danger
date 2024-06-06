'use client'

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
const boardInfo = require("../../../public/boardFiles/basicBoard1.json")

const questionStep = 100;

function QuestionBox({ value, question, answers, stateObject } : { value: number, question: string, answers: Array<string>, stateObject: any }) {
  const [isOpen, setOpen] = useState(false)
  const [isAnswered, setAnswered] = useState(false)
  const [givenAnswer, setGivenAnswer] = useState("")

  function answerQuestion() {
    if(answers.includes(givenAnswer.toLowerCase())){
      stateObject.setPlayer1Gold(stateObject.player1Gold + value)
    } else {
      stateObject.setPlayer1Gold(stateObject.player1Gold - value)
    }
    setOpen(!isOpen);
    setAnswered(true);
  }

  return (
    <motion.td layout className={ isOpen ? "block fixed top-0 left-0 h-screen w-screen bg-red-950 z-10" : "py-2 border-solid border-white border-2"}>
      <motion.span layout className={isOpen ? "hidden" : "flex flex-row items-center justify-center"}  onClick={() => {if(!isAnswered) setOpen(!isOpen) }}>
        <span className={isAnswered ? "hidden" : "bold"}>{ value }</span>
        <Image
            className={isAnswered ? "hidden" : "relative"}
            src="/icons/Gold_symbol.webp"
            alt="Gold Symbol"
            width={18}
            height={18}
            priority
          />
      </motion.span>
      <motion.div layout className={isOpen ? "h-screen mx-20 flex flex-col items-center justify-center gap-6" : "hidden"} onKeyDown={(event) => {
        if(event.code === "Enter")answerQuestion()
        }}>
        <div className="text-5xl font-extrabold">{ question }</div>
        <div className="text-5xl font-light italic">What is
        <input className="bg-transparent border-solid border-b-4 border-black ml-6" value={givenAnswer} onChange={e => setGivenAnswer(e.target.value)}/>
        ?</div>
      </motion.div>
    </motion.td>
  )
}

function QuestionRow({value, columns, stateObject} : { value: number, columns: Object, stateObject: any}){
  const rowIndex = ((value / questionStep) - 1);
  //Need to add in a way to load in questions
  const questionBoxes = Object.values(columns).map((column, index) =>
    <QuestionBox key={"column-" + index + "_value-" + value.toString()} value={value} question={column[rowIndex].question} answers={column[rowIndex].answers} stateObject={stateObject}/>
  );
  return (<tr>{questionBoxes}</tr>);
}

//Should probably write an actual object for this at some point
function QuestionTable({ boardInfo, stateObject } : {boardInfo: any, stateObject: any}){
  let columnInfo = boardInfo.columns;
  let columnNames = Object.keys(columnInfo)
  const tableHeaders = columnNames.map(column =>
    <th className="px-2 py-2 min-w-28 border-solid border-white border-2" key={"header_" + column}>{column}</th>
  )

  let rows = boardInfo.rows;
  //I feel like there has to be a better way to do this, in terms of code looking nice
  let rowArray = [];
  for(let i = 1; i <= rows; i++){
    rowArray.push(i * questionStep);
  }
  const rowElements = rowArray.map(rowValue => 
    <QuestionRow key={"row_" + rowValue} value={rowValue} columns={columnInfo} stateObject={stateObject}/>
  )
  return (
    <table className="bg-black">
      <thead>
        <tr>
          {tableHeaders}
        </tr>
      </thead>
      <tbody>
        {rowElements}
      </tbody>
    </table>
  )
}

function PlayerGoldTracker({ playerName, gold } : {playerName: string, gold: number}){
  return (
    <div className="bg-teal-900 w-60 flex flex-col text-center gap-4 border-solid border-black border-2">
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
      <div className="text-4xl">{ playerName }</div>
    </div>
  )
}

export default function Page() {
  const [player1Gold, setPlayer1Gold] = useState(0)

  let stateObject = { player1Gold, setPlayer1Gold }

  return (
    <main className="flex h-4/6 flex-col items-center justify-between p-12">
      <div className="z-10 w-full text-center flex justify-center">
        <QuestionTable key="question-table" boardInfo={boardInfo} stateObject={stateObject} />
      </div>
      <div className="fixed bottom-0 z-20 flex text-center justify-center h-1/6 mx-5">
        <PlayerGoldTracker key="player1-gold-tracker" playerName="Player1" gold={player1Gold}/>
      </div>
    </main>
  );
}