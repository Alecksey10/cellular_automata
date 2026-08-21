def calculate_source_metadata(
    source_code: str,
) -> tuple[int, int]:
    line_count = (
        source_code.count("\n") + 1
        if source_code
        else 0
    )

    size = len(
        source_code.encode("utf-8")
    )

    return line_count, size