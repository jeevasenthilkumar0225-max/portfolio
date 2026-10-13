import { getPortfolioData } from "@/lib/data";
import { PortfolioContent } from "./portfolio-content";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getPortfolioData();

  return <PortfolioContent data={data} />;
}

