import type {
    SearchCollection,
    SearchOwner,
    SearchQuery,
    SearchSort,
    SearchTag,
} from "../SearchTypes";

export class SearchQueryUriSerializer {
    serialize(query: SearchQuery): string {
        const params = new URLSearchParams();

        if (query.text) {
            params.set("text", query.text);
        }

        for (const tag of query.tags) {
            params.append("tags", JSON.stringify(tag));
        }

        for (const collection of query.collections) {
            params.append(
                "collections",
                JSON.stringify(collection),
            );
        }

        params.set("owner", query.owner);
        params.set("sort", query.sort);

        return params.toString();
    }

    serializeClearServer(query: SearchQuery): string {
        //Сериализация для серверного запроса, а не для хранения в URL
        const params = new URLSearchParams();

        if (query.text) {
            params.set("text", query.text);
        }

        for (const tag of query.tags) {
            params.append("tags", (tag.id.toString()));
        }

        for (const collection of query.collections) {
            params.append(
                "collections",
                (collection.id.toString()),
            );
        }

        params.set("owner", query.owner);
        params.set("sort", query.sort);

        return params.toString();
    }

    deserialize(uri: string): SearchQuery {
        const params = new URLSearchParams(
            uri.startsWith("?")
                ? uri.slice(1)
                : uri,
        );

        return {
            text: params.get("text") ?? "",
            tags: this.parseTags(params.getAll("tags")),
            collections: this.parseCollections(
                params.getAll("collections"),
            ),
            owner: this.parseOwner(params.get("owner")),
            sort: this.parseSort(params.get("sort")),
        };
    }

    private parseTags(values: string[]): SearchTag[] {
        return values.flatMap((value) => {
            try {
                const tag = JSON.parse(value);

                if (
                    typeof tag?.id === "string" &&
                    typeof tag?.name === "string"
                ) {
                    return [tag];
                }
            } catch {
                // Ignore invalid values.
            }

            return [];
        });
    }

    private parseCollections(
        values: string[],
    ): SearchCollection[] {
        return values.flatMap((value) => {
            try {
                const collection = JSON.parse(value);

                if (
                    typeof collection?.id === "string" &&
                    typeof collection?.name === "string"
                ) {
                    return [collection];
                }
            } catch {
                // Ignore invalid values.
            }

            return [];
        });
    }

    private parseOwner(
        value: string | null,
    ): SearchOwner {
        return value === "me" ? "me" : "any";
    }

    private parseSort(
        value: string | null,
    ): SearchSort {
        switch (value) {
            case "views":
            case "size":
            case "date":
            case "popular":
                return value;

            default:
                return "popular";
        }
    }
}