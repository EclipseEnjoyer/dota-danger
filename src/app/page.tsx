import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-12">
      <div className="z-10 w-full text-center flex flex-col gap-4">
        <Link key={'Solo'} href={'/solo'} className="font-serif text-5xl">
          <h2>Solo Game</h2>
        </Link>
        <Link key={'Multiplayer'} href={'/multiplayer'} className="font-serif text-5xl">
          <h2>Multiplayer Game</h2>
        </Link>
      </div>
    </main>
  );
}
