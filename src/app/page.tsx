import { OrbitDashboard } from "@/components/dashboard/orbit-dashboard";
import { OrbitProvider } from "@/context/orbit-context";

export default function HomePage() {
  return (
    <OrbitProvider>
      <OrbitDashboard />
    </OrbitProvider>
  );
}
