import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";

const questionStep = 100;

function QuestionBox({ value, question, answers, goldAdjustmentFunction } : { value: number, question: string, answers: Array<string>, goldAdjustmentFunction : (gold: number, positive: boolean) => void }) {
  const [isOpen, setOpen] = useState(false)
  const [isAnswered, setAnswered] = useState(false)
  const [givenAnswer, setGivenAnswer] = useState("")

  function answerQuestion() {
    if(answers.includes(givenAnswer.toLowerCase())){
      goldAdjustmentFunction(value, true)
    } else {
      goldAdjustmentFunction(value, false)
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

function QuestionRow({value, columns, goldAdjustmentFunction } : { value: number, columns: Object, goldAdjustmentFunction : (gold: number, positive: boolean) => void}){
  const rowIndex = ((value / questionStep) - 1);
  //Need to add in a way to load in questions
  const questionBoxes = Object.values(columns).map((column, index) =>
    <QuestionBox key={"column-" + index + "_value-" + value.toString()} value={value} question={column[rowIndex].question} answers={column[rowIndex].answers} goldAdjustmentFunction={goldAdjustmentFunction}/>
  );
  return (<tr>{questionBoxes}</tr>);
}

//Should probably write an actual object for this at some point
export default function QuestionTable({ boardInfo, goldAdjustmentFunction} : { boardInfo: any, goldAdjustmentFunction : (gold: number, positive: boolean) => void}){
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
    <QuestionRow key={"row_" + rowValue} value={rowValue} columns={columnInfo} goldAdjustmentFunction={goldAdjustmentFunction}/>
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