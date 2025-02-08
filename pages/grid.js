import Grid from "../src/components/Grid";
import Header from "../src/components/Header";
import { useSession } from "next-auth/react";

GridPage.requiresAuth = true;

export default function GridPage() {
  const { data: session } = useSession();

  return (
    <>
      <Header />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Super Bowl Squares Grid</h1>
        <Grid />
      </div>
    </>
  );
}
