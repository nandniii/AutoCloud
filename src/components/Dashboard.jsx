import StorageOverview from "./StorageOverview";
import CleanupHistory from "./CleanupHistory";
import AISuggestions from "./AISuggestions";
import StorageCharts from "./StorageCharts";
import ThemeToggle from "./ThemeToggle";
import{HardDrive} from "lucide-react";

function Dashboard() {
  return (
     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HardDrive className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-gray-900 dark:text-white">Storage Dashboard</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Storage Overview Section */}
        <section className="relative z-10">
          <h2 className="text-gray-900 dark:text-white mb-4">Storage Overview</h2>
          <StorageOverview />
          
        </section>

        {/* Charts Section */}
        <section>
          <h2 className="text-gray-900 dark:text-white mb-4">Usage Analytics</h2>
          <StorageCharts />
        </section>

        {/* AI Suggestions and Cleanup History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section>
            <h2 className="text-gray-900 dark:text-white mb-4">AI Suggestions</h2>
            <AISuggestions />
          </section>

          <section>
            <h2 className="text-gray-900 dark:text-white mb-4">Cleanup History</h2>
            <CleanupHistory />
          </section>
        </div>
      </div>
    </main>
    </div>
  );
}
export default Dashboard;