import Image from "next/image";

function QuestionBox({ value } : { value: number }) {
  return (
    <td>
      { value }
      <Image
          className="relative"
          src="/icons/Gold_symbol.webp"
          alt="Gold Symbol"
          width={18}
          height={18}
          priority
        />
    </td>
  )
}

function QuestionRow({value, columns} : { value: number, columns: Array<string>}){
  const questionBoxes = columns.map(column =>
    <QuestionBox key={column + value.toString()} value={value}/>
  );
  return (<tr>{questionBoxes}</tr>);
}

function QuestionTable({columns, rows, step} : {columns: Array<string>, rows: number, step: number}){
  const tableHeaders = columns.map(column =>
    <th key={"header_" + column}>{column}</th>
  )
  //I feel like there has to be a better way to do this, in terms of code looking nice
  let rowArray = [];
  for(let i = 1; i <= rows; i++){
    rowArray.push(i * step);
  }
  const rowElements = rowArray.map(rowValue => 
    <QuestionRow key={"row_" + rowValue} value={rowValue} columns={columns}/>
  )
  return (
    <table >
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
      <div className="z-10 w-full text-center">
        <QuestionTable columns={['Items', 'Meta History', 'Map Knowledge', 'Hero Abilities', 'Jungle Creeps']} rows={5} step={100}/>
      </div>
    </main>
  );
}