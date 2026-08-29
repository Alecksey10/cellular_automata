import type {
    SearchQuery,
    SearchValidation,
} from "../SearchTypes";


export class SearchValidator {

    validate(
        query: SearchQuery,

        incomplete: boolean,

        errors: string[],
    ): SearchValidation {

        if (errors.length > 0) {

            return {
                status: "invalid",
                errors,
            };
        }


        if (incomplete) {

            return {
                status: "incomplete",
                errors: [],
            };
        }


        if (
            query.text.length === 0 &&
            query.tags.length === 0 &&
            query.collections.length === 0 &&
            query.owner === "any" &&
            query.sort === "popular"
        ) {

            return {
                status: "empty",
                errors: [],
            };
        }


        return {
            status: "valid",
            errors: [],
        };
    }
}
