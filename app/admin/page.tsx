import { Button } from "@/components/ui/button";

export default function Adm() {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center gap-24">
      <Button asChild>
        <a href="/apple/admin">Velocity of Money Admin Page</a>
      </Button>
      <Button asChild>
        <a href="/public/admin">Public Goods Admin Page</a>
      </Button>
      {/* ADD DB RESET AND EXPORT TO CSV */}
    </main>
  );
}
