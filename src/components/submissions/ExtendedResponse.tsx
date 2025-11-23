import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FileText } from "lucide-react";

interface ExtendedResponseProps {
  extendedResponse?: string | null;
}

export function ExtendedResponse({ extendedResponse }: ExtendedResponseProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Extended Response</CardTitle>
      </CardHeader>
      <CardContent>
        {extendedResponse ? (
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{extendedResponse}</p>
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="No extended response"
            description="The student hasn't submitted an extended response for this assignment."
          />
        )}
      </CardContent>
    </Card>
  );
}

