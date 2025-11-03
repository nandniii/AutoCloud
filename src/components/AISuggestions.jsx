import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Lightbulb, Trash2, Archive, FileText } from "lucide-react";

const suggestions = [
  {
    id: 1,
    title: "Large duplicate files detected",
    description: "Found 47 duplicate files in Google Drive totaling 3.2 GB",
    impact: "3.2 GB",
    priority: "high",
    icon: FileText,
    action: "Review Duplicates",
  },
  {
    id: 2,
    title: "Old email attachments",
    description: "Gmail contains 150+ emails with attachments older than 1 year",
    impact: "1.8 GB",
    priority: "medium",
    icon: Trash2,
    action: "Clean Up",
  },
  {
    id: 3,
    title: "Archived photos in high quality",
    description: "Convert 200 archived photos to storage-saver quality",
    impact: "2.5 GB",
    priority: "medium",
    icon: Archive,
    action: "Optimize",
  },
  {
    id: 4,
    title: "Unused mobile backups",
    description: "3 old device backups that are no longer needed",
    impact: "4.1 GB",
    priority: "high",
    icon: Trash2,
    action: "Remove Backups",
  },
];

const priorityColors = {
  high: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
  low: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
};

 function AISuggestions() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-6">
          <Lightbulb className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
          <h3 className="text-gray-900 dark:text-white">Smart Cleanup Recommendations</h3>
        </div>

        <div className="space-y-4">
          {suggestions.map((suggestion) => {
            const Icon = suggestion.icon;
            return (
              <div
                key={suggestion.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg mt-1">
                    <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-gray-900 dark:text-white">{suggestion.title}</h4>
                      <Badge
                        variant="outline"
                        className={priorityColors[suggestion.priority]}
                      >
                        {suggestion.impact}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{suggestion.description}</p>

                    <Button size="sm" variant="outline" className="w-full sm:w-auto">
                      {suggestion.action}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">Potential savings:</p>
            <p className="text-gray-900 dark:text-white">11.6 GB</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
export default AISuggestions;