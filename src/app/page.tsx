import { getPortfolioData } from "@/lib/data";
import { PortfolioContent } from "./portfolio-content";

export const dynamic = "force-dynamic";

export default function Home() {
  const data = getPortfolioData();

  return <PortfolioContent data={data} />;
}

