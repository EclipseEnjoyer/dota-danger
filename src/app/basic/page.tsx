'use client'

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
const boardInfo = require("../../../public/boardFiles/basicBoard1.json")

const questionStep = 100;



function QuestionBox({ value, question, answers } : { value: number, question: string, answers: Array<string> }) {
  const [isOpen, setOpen] = useState(false)
  const [isAnswered, setAnswered] = useState(false)

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
      <motion.div layout className={isOpen ? "h-screen w-screen flex flex-col items-center justify-center gap-6" : "hidden"} onKeyDown={(event) => {
        console.log('Key event?', event)
        if(event.code === "Enter")setOpen(!isOpen);setAnswered(true);
        }}>
        <div className="text-5xl font-extrabold">{ question }</div>
        <div className="text-5xl font-light italic">What is
        <input className="bg-transparent border-solid border-b-4 border-black ml-6"/>
        ?</div>
      </motion.div>
    </motion.td>
  )
}

function QuestionRow({value, columns} : { value: number, columns: Object}){
  const rowIndex = ((value / questionStep) - 1);
  //Need to add in a way to load in questions
  const questionBoxes = Object.values(columns).map(column =>
    <QuestionBox  key={column + value.toString()} value={value} question={column[rowIndex].question} answers={column[rowIndex].answers}/>
  );
  return (<tr>{questionBoxes}</tr>);
}

//Should probably write an actual object for this at some point
function QuestionTable({ boardInfo } : {boardInfo: any}){
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
    <QuestionRow key={"row_" + rowValue} value={rowValue} columns={columnInfo}/>
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

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-12">
      <div className="z-10 w-full text-center flex justify-center">
        <QuestionTable boardInfo={boardInfo} />
      </div>
    </main>
  );
}