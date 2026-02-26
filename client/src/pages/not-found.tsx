import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="flex flex-col items-center max-w-md text-center space-y-6">
        <AlertTriangle className="h-24 w-24 text-destructive animate-pulse" />
        
        <h1 className="text-6xl font-display font-black text-primary tracking-widest">
          404
        </h1>
        
        <p className="text-xl font-mono text-muted-foreground">
          The trajectory you are looking for does not exist in this timeline.
        </p>

        <Link href="/">
          <Button size="lg" className="mt-8 bg-primary text-black font-bold tracking-widest hover:bg-primary/80">
            RETURN TO BASE
          </Button>
        </Link>
      </div>
    </div>
  );
}
