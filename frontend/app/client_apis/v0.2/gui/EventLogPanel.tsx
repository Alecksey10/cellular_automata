import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import type { EventBus } from "../runtime/EventBus";
import type { AutomatonEvent } from "../contract/types/events";

interface Props {
  eventBus: EventBus | null;
  maxEntries?: number;
}

const BADGE_VARIANT: Record<AutomatonEvent["type"], string> = {
  info: "bg-blue-100 text-blue-800",
  warning: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-800",
  request: "bg-purple-100 text-purple-800",
};

export function EventLogPanel({ eventBus, maxEntries = 50 }: Props) {
  const [events, setEvents] = useState<AutomatonEvent[]>([]);

  useEffect(() => {
    if (!eventBus) return;

    const handler = (event: unknown) => {
      const e = event as AutomatonEvent;
      setEvents((prev) => {
        const next = [e, ...prev];
        return next.length > maxEntries ? next.slice(0, maxEntries) : next;
      });
    };

    eventBus.on("automaton:event", handler);
    return () => eventBus.off("automaton:event", handler);
  }, [eventBus, maxEntries]);

  if (events.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">События</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48">
          <div className="space-y-2">
            {events.map((event, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm"
              >
                <Badge
                  variant="outline"
                  className={`shrink-0 text-xs ${BADGE_VARIANT[event.type]}`}
                >
                  {event.type}
                </Badge>
                <span className="text-muted-foreground">
                  {event.message}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}