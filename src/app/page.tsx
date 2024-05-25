import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-12">
      <div className="z-10 w-full text-center">
        <Link key={'Basic'} href={'/basic'} className="font-serif text-5xl">
          <h2>Basic Board</h2>
        </Link>
      </div>
    </main>
  );
}
