import type { SearchQuery } from "../SearchTypes";
export class SearchQuerySerializer {
    serialize(query: SearchQuery): string {
        const parts: string[] = [];

        if (query.text.trim()) {
            parts.push(query.text.trim());
        }

        for (const tag of query.tags) {
            parts.push(
                `tag:${this.serializeValue(tag.name)}`,
            );
        }

        for (const collection of query.collections) {
            parts.push(
                `collection:${this.serializeValue(collection.name)}`,
            );
        }

        if (query.owner !== "any") {
            parts.push(`owner:${query.owner}`);
        }

        if (query.sort !== "popular") {
            parts.push(`sort:${query.sort}`);
        }

        return parts.join(" ");
    }

    private serializeValue(value: string): string {
        if (/^[^\s"]+$/.test(value)) {
            return value;
        }

        return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
    }
}